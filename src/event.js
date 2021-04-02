
class PriorityEvent
{
    #cached
    #cache
    constructor()
    {
        this.listeners = {};
        this.#cached = true;
        this.#cache = [];
    }

    addEventListener(obj, priority=0)
    {
        if(this.listeners[priority] === undefined)
        {
            this.listeners[priority] = [];
        }

        this.listeners[priority].push(obj);

        this.#cached = false;
    }

    removeEventListener(obj)
    {
        for (const [key, value] of Object.entries(this.listeners)) {
            let new_arr = value.filter(el => obj !== el);

            this.listeners[key] = new_arr.length === 0?undefined:new_arr;
        }

        this.#cached = false;
    }

    fire(kwargs)
    {
        this.#prepareCache();
        this.#fireCache(kwargs);
    }

    #prepareCache()
    {
        if(!this.#cached)
        {
            let sorted = Object.entries(this.listeners); // returns [[priority, callbacks], ...]
            sorted.sort(function(a, b) {
                return b[0] - a[0]; // sort with the listener keys (that is the priority number)
            });

            this.#cache = [];

            for(let i = 0; i < sorted.length; i++)
            {
                this.#cache.push(...sorted[i][1]); // extend with the listener values (that is the callbacks)
            }

            this.#cached = true;
        }
    }

    #fireCache(kwargs)
    {
        let ev = kwargs || {};
        ev.cancelled = false;
        ev.cancel = ()=>ev.cancelled = true;

        for(let i = 0; i < this.#cache.length && !ev.cancelled; i++)
        {
            this.#cache[i](ev);
        }
    }

    get size()
    {
        let sum = 0;
        for (const [key, value] of Object.entries(this.listeners)) {
            sum += value.length;
        }
        return sum;
    }
}

class PriorityEventMapping
{
    constructor()
    {
        this.events = {};
    }

    addEventListener(name, obj, priority=0)
    {
        if(this.events[name] === undefined)
        {
            this.events[name] = new PriorityEvent();
        }

        this.events[name].addEventListener(obj, priority);
    }

    removeEventListener(name, obj)
    {
        let ev = this.events[name]
        if(ev !== undefined)
        {
            ev.removeEventListener(obj);

            if(ev.size == 0)
            {
                this.events[name] = undefined;
            }
        }
    }

    fire(name, kwargs)
    {
        let ev = this.events[name];
        if(ev !== undefined)
        {
            ev.fire(kwargs);
        }
    }

    
    delegate(name)
    {
        return this.fire.bind(this, name);
    }
}

export {PriorityEvent, PriorityEventMapping}