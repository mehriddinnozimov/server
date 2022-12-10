export class EventEmitter {
    protected events = new Map();
    constructor() {}

    public on(event: string, listener: Function) {
      if (typeof listener !== 'function') {
        throw new TypeError('The listener must be a function');
      }
      let listeners = this.events.get(event);
      if (!listeners) {
        listeners = new Set();
        this.events.set(event, listeners); 
      }
      listeners.add(listener);
      return this;
    }

    public off(event: string, listener: Function) {
      if (!arguments.length) {
        this.events.clear();
      } else if (arguments.length === 1) {
        this.events.delete(event);
      } else {
        const listeners = this.events.get(event);
        if (listeners) {
          listeners.delete(listener);
        }
      }
      return this;
    }

    public emit(event: string, ...args: any[]) {
      const listeners = this.events.get(event);
      if (listeners) {
        for (let listener of listeners) {
          listener.apply(this, args);
        }
      }
      return this;
    }
}