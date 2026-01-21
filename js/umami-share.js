((global) => {
	const cacheKey = "umami-share-cache";
	const cacheTTL = 3600_000; // 1h

	async function fetchShareData(baseUrl, shareId) {
		const cached = localStorage.getItem(cacheKey);
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				if (Date.now() - parsed.timestamp < cacheTTL) {
					return parsed.value;
				}
			} catch {
				localStorage.removeItem(cacheKey);
			}
		}
		const res = await fetch(`${baseUrl}/api/share/${shareId}`);
		if (!res.ok) {
			throw new Error("获取 Umami 分享信息失败");
		}
		const data = await res.json();
		localStorage.setItem(
			cacheKey,
			JSON.stringify({ timestamp: Date.now(), value: data }),
		);
		return data;
	}

	/**
	 * 获取 Umami 分享数据（websiteId、token）
	 * 在缓存 TTL 内复用；并用全局 Promise 避免并发请求
	 * @param {string} baseUrl
	 * @param {string} shareId
	 * @returns {Promise<{websiteId: string, token: string}>}
	 */
	global.getUmamiShareData = (baseUrl, shareId) => {
		if (!global.__umamiSharePromise) {
			global.__umamiSharePromise = fetchShareData(baseUrl, shareId).catch(
				(err) => {
					delete global.__umamiSharePromise;
					throw err;
				},
			);
		}
		return global.__umamiSharePromise;
	};

	global.clearUmamiShareCache = () => {
		localStorage.removeItem(cacheKey);
		delete global.__umamiSharePromise;
	};

	// 初始化全局缓存 Map
	if (!global.__umamiDataCache) {
		global.__umamiDataCache = new Map();
	}

	/**
	 * 获取 Umami 统计数据
	 * 自动处理 token 获取和过期重试
	 * @param {string} baseUrl
	 * @param {string} shareId
	 * @param {object} queryParams
	 * @returns {Promise<any>}
	 */
	global.fetchUmamiStats = async (baseUrl, shareId, queryParams) => {
		// 生成缓存键：baseUrl + shareId + queryParams的字符串表示
		const cacheKey = `${baseUrl}|${shareId}|${JSON.stringify(queryParams)}`;
		
		// 检查全局内存缓存
		if (global.__umamiDataCache.has(cacheKey)) {
            const data = global.__umamiDataCache.get(cacheKey);
            // 标记数据来自缓存
            return { ...data, _fromCache: true };
		}

		async function doFetch(isRetry = false) {
			const { websiteId, token } = await global.getUmamiShareData(
				baseUrl,
				shareId,
			);
			const currentTimestamp = Date.now();
			// 构造查询参数
            const requestParams = {
				startAt: 0,
				endAt: currentTimestamp,
				unit: "hour",
				timezone: queryParams.timezone || "Asia/Shanghai",
				...queryParams,
			};
            
            // 构造最终的 URLSearchParams
            const params = new URLSearchParams();
            
            for (const [key, value] of Object.entries(requestParams)) {
                if (key === 'url') {
                    // Umami v3 特殊逻辑：参数名变更为 'path'，且需要 'eq.' 前缀
                    // 处理 URL 编码：先解码再编码，避免重复编码导致 400 错误
                    let pathValue = value;
                    try {
                        pathValue = decodeURIComponent(value);
                    } catch (e) {
                        // ignore
                    }
                    
                    // 确保路径以 / 开头（如果是相对路径）
                    // if (!pathValue.startsWith('/') && !pathValue.startsWith('http')) {
                    //    pathValue = '/' + pathValue;
                    // }

                    // 用户指出：需要使用 eq. 前缀，参数名为 path
                    // 这里不对 pathValue 进行 encodeURIComponent，因为 URLSearchParams 会自动编码
                    // 但是我们需要确保传入的是原始字符串，而不是已经编码过的
                    params.append('path', `eq.${pathValue}`); 
                } else {
                    params.append(key, value);
                }
            }

			const statsUrl = `${baseUrl}/api/websites/${websiteId}/stats?${params.toString()}`;

            console.log('[Umami Debug] Fetching stats:', {
                baseUrl,
                shareId,
                websiteId,
                token: token ? token.substring(0, 10) + '...' : 'null',
                statsUrl,
                params: params.toString()
            });

			const res = await fetch(statsUrl, {
				headers: {
					"x-umami-share-token": token,
				},
			});

            if (!res.ok) {
                console.warn(`[Umami Debug] Request failed with status ${res.status}`);
                // 如果是 404，可能是 websiteId 不正确（Share ID 对应的网站与当前配置的 ID 不一致？）
                if (res.status === 404) {
                     console.error('[Umami Debug] 404 Not Found. Please check if websiteId matches the shareId.');
                }
            }

			if (!res.ok) {
				if (res.status === 401 && !isRetry) {
					global.clearUmamiShareCache();
					return doFetch(true);
				}
                // 忽略 400 Bad Request 错误，可能是因为 path 格式不正确（例如包含特殊字符）
                if (res.status === 400) {
                    console.warn(`Umami API returned 400 for ${statsUrl}`);
                    return null;
                }
				throw new Error("获取统计数据失败");
			}

			const data = await res.json();
			// 写入全局缓存
			global.__umamiDataCache.set(cacheKey, data);
			return data;
		}

		return doFetch();
	};
})(window);
