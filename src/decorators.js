const defer = (window.requestIdleCallback || requestAnimationFrame);
/**
 * 
 * @param {string} name 
 * @returns void
 */
export function customElement(name) {
  return (value, { addInitializer }) => {
    addInitializer(function() {
      customElements.define(name, this);
    });
  }
}

/**
 * @param {BooleanConstructor|StringConstructor} type
 */
export function property(type) {
  /**
   * @param {undefined} _value
   * @param {{ kind: string, name: string | symbol }} options
   */
  return function(_value, { kind, name }) {
    if (kind === 'field') {
      return function (initialValue) {
        console.log(`initializing ${String(name)} with value ${initialValue}`);
        /**
         * Undefined at this time
         * Decorators are called (as functions) during class definition, 
         * after the methods have been evaluated but before the constructor 
         * and prototype have been put together.
         * https://github.com/tc39/proposal-decorators#detailed-design
         */
        console.log('descriptor', Object.getOwnPropertyDescriptor(this, name));
        /**
         * Uncaught TypeError: Cannot redefine property: checked
         * 所以需要等待这个class的定义工作结束后再来defineProperty，
         * 把defer换成settimeout也是可以的，但总感觉两个方法都不是最佳的...
         */
        defer(() => {
          Object.defineProperty(this, name, {
            get() {
              if (type === Boolean) {
                return this.hasAttribute(name);
              } else if (type === String) {
                /**
                 * 如果类型是string的话，当组件上面没有添加该属性时，e.g.: <my-button></my-button>
                 * 假设想要关注的属性是theme，此时this.getAttribute('theme')等于null，typeof null是object,
                 * 但是我们想要的类型是string，所以需要加上一个??在这里？
                 */
                return this.getAttribute(name) ?? '';

                /**
                 * 也想到了这个，但是这个不合理，因为写组件时并不知道组件添加的theme值，
                 * 所以应该是不能设置初始值的
                 */
                return this.getAttribute(name) ?? initialValue ?? '';
              }
            },
            set(flag) {
              if (type === Boolean) {
                this.toggleAttribute(name, Boolean(flag));
              } else if (type === String) {
                this.setAttribute(name, flag);
              }
            },
            configurable: true,
            enumerable: true,
          });
        });
  
        return initialValue;
      };
    }
  }
}