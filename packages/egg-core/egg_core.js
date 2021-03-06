const Koa = require('koa');
const Router = require('./utils/router');

/**
 * 为了 egg 到时候能找到 EGG_LOADER
 */
const EGG_LOADER = Symbol.for('egg#loader');
const EGG_CORE_ROUTER = Symbol.for('eggCore#router');
const METHODS = ['head', 'get', 'post', 'put', 'delete', 'patch', 'all', 'options'];

/**
 * 基于 Koa 进行封装，管理路由和加载器
 */
class EggCore extends Koa {
  constructor(options) {
    options.baseDir = options.baseDir || process.env();
    options.type = options.type || 'application';
    super(options);

    const Loader = this[EGG_LOADER]; // 搜寻的是 egg 中的 AppWorkLoader
    /**
     * 实例化 Loader 得到 this.loader，这个 Loader 是 AppWorkLoader
     */
    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
    });
  }

  get router() {
    if (this[EGG_CORE_ROUTER]) {
      return this[EGG_CORE_ROUTER];
    }

    /**
     * 实例化 Router，这个 Router 是基于 KoaRouter 的封装
     */
    const router = new Router(
      { sensitive: true },
      this
    );
    this[EGG_CORE_ROUTER] = router;
    this.beforeStart(() => {
      /**
       * 使用 router 中间件
       */
      this.use(router.middleware());
    });

    return router;
  }

  beforeStart(fn) {
    process.nextTick(fn);
  }
}

/**
 * 注册支持的路由方法
 * 同时也会把这些方法挂载到 this.router 对象上去，到时候也可以通过 app.router 访问
 */
METHODS.concat(['resources', 'register', 'redirect']).forEach((method) => {
  EggCore.prototype[method] = function router(...args) {
    this.router[method](...args);
    return this;
  };
});

module.exports = EggCore;
