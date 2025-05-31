// 创建并立即执行
(function() {
    // 动态配置对象
    const live2dConfig = {
        path: {
            homePath: '/',
            modelPath: 'https://cdn3.xcqcoo.top/jsd/gh/QC3284/hugo-static-resource@latest/live2d/live2d-moc3/',
            cssPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/waifu.css',
            tipsJsonPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/waifu-tips.json',
            tipsJsPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/waifu-tips.js',
            live2dCorePath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/Core/live2dcubismcore.js',
            live2dSdkPath: 'https://cdn3.xcqcoo.top/jsd/gh/letere-gzj/live2d-widget-v3@latest/live2d-sdk.js'
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
