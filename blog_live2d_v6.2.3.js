// 创建并立即执行
(function() {
    // 动态配置对象
    const live2dConfig = {
        path: {
            homePath: '/',
            modelPath: 'https://cdn4.xcqcoo.top/gh/QC3284/hugo-static-resource@latest/live2d/live2d-moc3/',
            cssPath: 'https://cdn4.xcqcoo.top/gh/letere-gzj/live2d-widget-v3@latest/waifu.css',
            tipsJsonPath: 'https://cdn4.xcqcoo.top/gh/QC3284/live2d-widget-v3@latest/waifu-tips.json',
            tipsJsPath: 'https://cdn4.xcqcoo.top/gh/letere-gzj/live2d-widget-v3@latest/waifu-tips.js',
            live2dCorePath: 'https://cdn4.xcqcoo.top/gh/letere-gzj/live2d-widget-v3@latest/Core/live2dcubismcore.js',
            live2dSdkPath: 'https://cdn4.xcqcoo.top/gh/letere-gzj/live2d-widget-v3@latest/live2d-sdk.js'
        },
        tools: ["hitokoto", "asteroids", "express", "switch-model", "switch-texture", "photo", "info", "quit"],
        drag: { enable: true, direction: ["x", "y"] },
        switchType: "order"
    };

    // 资源加载器
    const resourceLoader = (url, type) => {
        return new Promise((resolve, reject) => {
            const element = type === 'css' 
                ? Object.assign(document.createElement('link'), { rel: 'stylesheet', href: url })
                : Object.assign(document.createElement('script'), { src: url });

            element.onload = () => resolve(`Loaded ${url}`);
            element.onerror = () => reject(`Failed to load ${url}`);
            document.head.append(element);
        });
    };

    // 响应式检测
    const initLive2D = () => {
        if (window.innerWidth < 768) return;

        Promise.all([
            resourceLoader(live2dConfig.path.cssPath, 'css'),
            resourceLoader(live2dConfig.path.live2dCorePath, 'js'),
            resourceLoader(live2dConfig.path.live2dSdkPath, 'js'),
            resourceLoader(live2dConfig.path.tipsJsPath, 'js')
        ]).then(() => {
            // 添加z-index样式确保显示在最前面
            const style = document.createElement('style');
            style.innerHTML = `
                #waifu {
                    z-index: 10000 !important;
                }
            `;
            document.head.appendChild(style);
            
            // 初始化函数来自 waifu-tips.js
            if (typeof initWidget === 'function') {
                initWidget({
                    homePath: live2dConfig.path.homePath,
                    waifuPath: live2dConfig.path.tipsJsonPath,
                    cdnPath: live2dConfig.path.modelPath,
                    tools: live2dConfig.tools,
                    dragEnable: live2dConfig.drag.enable,
                    dragDirection: live2dConfig.drag.direction,
                    switchType: live2dConfig.switchType
                });
            }

            // 监听所有类型的路由变化
            const handleRouteChange = () => {
                // 移除所有事件监听器
                window.removeEventListener('popstate', handleRouteChange);
                window.removeEventListener('pushState', handleRouteChange);
                window.removeEventListener('replaceState', handleRouteChange);
                window.removeEventListener('hashchange', handleRouteChange);
                
                // 强制刷新页面
                window.location.reload();
            };
            
            // 监听标准路由事件
            window.addEventListener('popstate', handleRouteChange);
            window.addEventListener('hashchange', handleRouteChange);
            
            // 监听单页应用的路由变化
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
            history.pushState = function() {
                originalPushState.apply(this, arguments);
                window.dispatchEvent(new Event('pushState'));
            };
            
            history.replaceState = function() {
                originalReplaceState.apply(this, arguments);
                window.dispatchEvent(new Event('replaceState'));
            };
            
            window.addEventListener('pushState', handleRouteChange);
            window.addEventListener('replaceState', handleRouteChange);
        }).catch(console.error);
    };

    // 延迟加载防止阻塞
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(initLive2D, 300);
    });

    // 窗口大小变化监听
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && !document.querySelector('#waifu')) {
            initLive2D();
        }
    });
})();
