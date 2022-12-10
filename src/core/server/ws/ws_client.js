class WS {
    #ws
    #events = new Map();
    isConnected = false
    uid
    constructor(url) {
        this.#ws = new WebSocket(url)

        this.#ws.onopen = (e) => {
            console.log('Websocket is connected')
            this.isConnected = true
        }
        this.#ws.onmessage = (e) => {
            const { event, message, uid } = JSON.parse(e.data)
            this.uid = uid
            this.sendOn(event, message)
        }
    }

    on(event, listener) {
        if (typeof listener !== 'function') {
            throw new TypeError('The listener must be a function');
        }
        if(event === 'error') {
            this.#ws.onerror = listener
        } else if (event === 'close') {
            this.#ws.onclose = listener
        } else {
            let listeners = this.#events.get(event);
            if (!listeners) {
                listeners = new Set();
                this.#events.set(event, listeners); 
            }
            listeners.add(listener);
        }
        return this;
    }

    sendOn(event, ...args) {
        const listeners = this.#events.get(event);
        if (listeners) {
          for (let listener of listeners) {
            listener.apply(this, args);
          }
        }
    }

    off(event, listener) {
        if (!arguments.length) {
            this.#events.clear();
        } else if (arguments.length === 1) {
            this.#events.delete(event);
        } else {
            const listeners = this.#events.get(event);
            if (listeners) {
                listeners.delete(listener);
            }
        }
        return this;
    }

    emit(event, message) {
        const data = {
            event, 
            message
        }
        if(this.isConnected) {
            this.#ws.send(JSON.stringify(data))
        } else {
            const interval = setInterval(() => {
                if(this.isConnected) {
                    this.#ws.send(JSON.stringify(data))
                    clearInterval(interval)
                }
            }, 10)

        }
        return this;
    }
}