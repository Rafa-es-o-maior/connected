function figureOutNextPosition(el)
{
    let rect = el.getBoundingClientRect();

    return {x: rect.right, y: rect.top};
}

class Context
{
    #x
    #y

    constructor(context, x, y, parent)
    {
        this.parent = parent;
        this.child = null;
        this.childButton = null;
        this.context = context;

        this.initX = x;
        this.initY = y;

        this.context = context;

        this.root = document.createElement("div");

        this.root.classList.add("context-root");

        this.root.style.position = "fixed";
        this.root.style.width = "200px";
        this.root.style.backgroundColor = "#dddddd";
        this.root.style.zIndex = 2;

        this.shadow = document.createElement("div");

        this.shadow.classList.add("context-shadow");

        this.shadow.style.position = "fixed";
        this.shadow.style.width = "200px";
        this.shadow.style.backgroundColor = "#dddddd";
        this.shadow.style.zIndex = 1;
        this.shadow.style.boxShadow = "black 0 0 5px 2px";

        this.innerShadow = document.createElement("div");
        this.innerShadow.style.boxShadow = "black 0px 0px 0px 1px inset";
        this.innerShadow.style.position = "absolute";
        this.innerShadow.style.top = "0";
        this.innerShadow.style.left = "0";
        this.innerShadow.style.width = "100%";
        this.innerShadow.style.height = "100%";
        this.innerShadow.style.zIndex = "2";
        this.innerShadow.style.pointerEvents = "none";

        this.x = 0;
        this.y = 0;

        this.root.addEventListener("contextmenu", (ev)=>ev.preventDefault());

        let body = document.getElementById("root");

        body.appendChild(this.root);
        body.appendChild(this.shadow);
        this.root.appendChild(this.innerShadow);

        let _this = this;

        let entries = Object.entries(this.context);

        if(entries.length == 0)
        {
            let b = document.createElement("button");

            b.innerHTML = "no options here";

            b.style.display = "block";
            b.style.width = "100%";
            b.style.border = "0";
            b.style.zIndex = "1";
            b.style.position = "relative";
            b.style.backgroundImage = "linear-gradient(#eeeeee, #dddddd)";

            b.setAttribute("disabled", "")

            this.root.appendChild(b);
        }
        else
        {
            for (let [key, value] of entries)
            {
                let b = document.createElement("button");
                b.innerHTML = key;

                b.style.display = "block";
                b.style.width = "100%";
                b.style.border = "0";
                b.style.zIndex = "1";
                b.style.position = "relative";
                b.style.backgroundImage = "linear-gradient(#eeeeee, #dddddd)";

                this.root.appendChild(b);

                if((typeof value) === "object")
                {
                    b.addEventListener("click", function(){
                        let pos = figureOutNextPosition(this);

                        _this.openFor(this, value, pos.x, pos.y);
                    });
                }
                if((typeof value) === "function")
                {
                    b.addEventListener("click", function(){
                        let out = value();
                        let pos = figureOutNextPosition(this);
                        if((typeof out) === "object")
                        {
                            _this.openFor(this, out, pos.x, pos.y);
                        }
                        else
                        {
                            _this.getTopOwner().destroy();
                        }
                    });
                }
            }
        }

        requestAnimationFrame(()=>{
            this.position();

            this.root.style.transition = null;
            this.shadow.style.transition = null;

            let rect = this.root.getBoundingClientRect();

            this.shadow.style.height = rect.height;
        })
    }

    position()
    {
        let pos = this.getCalculatedRelativePosition();
        let rect = this.root.getBoundingClientRect();

        this.x = this.initX + pos.x;
        this.y = this.initY + pos.y;
        
        this.root.style.transition = "top 0.2s, left 0.2s";
        this.shadow.style.transition = "top 0.2s, left 0.2s";
        
        if(this.child !== null)
        {
            let nextPos = this.childButton.getBoundingClientRect();
            
            let relativeTop = nextPos.top - rect.top;

            this.child.initX = this.initX + pos.x + 200;
            this.child.initY = this.initY + pos.y + relativeTop;

            this.child.position();
        }
    }

    getCalculatedRelativePosition()
    {
        let rect = this.root.getBoundingClientRect();

        let x;
        let y;

        if(this.initY + rect.height > window.innerHeight)
        {
            y = -rect.height;
        }
        else
        {
            y = 0;
        }

        if(this.initX + rect.width > window.innerWidth)
        {
            x = -400;
        }
        else
        {
            x = 0;
        }

        return {x, y}
    }

    getTopOwner()
    {
        return this.parent === undefined? this : this.parent.getTopOwner();
    }

    destroy()
    {
        this.root.remove();
        this.shadow.remove();
        if(this.child !== null)
        {
            this.child.destroy();
        }
    }

    openFor(button, context, x, y)
    {
        if(this.child !== null)
        {
            this.child.destroy();
        }

        this.child = new Context(context, x, y, this);
        this.childButton = button;
    }

    setPosition(x, y)
    {
        this.x = x;
        this.y = y;
    }

    get x()
    {
        return this.#x;
    }
    
    set x(value)
    {
        this.#x = value;
        this.root.style.left = value + "px";
        this.shadow.style.left = value + "px";
    }

    get y()
    {
        return this.#y;
    }
    
    set y(value)
    {
        this.#y = value;
        this.root.style.top = value + "px";
        this.shadow.style.top = value + "px";
    }
}

class MouseContext extends Context
{
    constructor(ctx, x, y)
    {
        super(ctx, x, y)

        let body = document.getElementById("root");
        
        this.blob = document.createElement("div");

        this.blob.style.position = "absolute";
        this.blob.style.top = (y - 5) + "px";
        this.blob.style.left = (x - 5) + "px";
        this.blob.style.width = "10px";
        this.blob.style.height = "10px";
        this.blob.style.backgroundColor = "#ff0000";
        this.blob.style.borderRadius = "5px";

        body.appendChild(this.blob)
    }
    getCalculatedRelativePosition()
    {
        let rect = this.root.getBoundingClientRect();

        let x;
        let y;

        if(this.initY + rect.height > window.innerHeight)
        {
            y = -rect.height;
        }
        else
        {
            y = 0;
        }

        if(this.initX + rect.width > window.innerWidth)
        {
            x = -200;
        }
        else
        {
            x = 0;
        }

        return {x, y}
    }

    destroy()
    {
        this.blob.remove();
        super.destroy();
    }
}

class PermanentContext extends Context
{
    destroy() // skip deleting self element
    {
        if(this.child !== null)
        {
            this.child.destroy();
        }
    }
}

function merge(self, other)
{
    for (let [key, value] of Object.entries(other))
    {
        if((typeof value) === "object")
        {
            if(self[key] === undefined)
            {
                self[key] = {};
            }

            merge(self[key], value);
        }
        else
        {
            if(self[key] !== undefined)
            {
                throw new Error("Could not merge at key " + key);
            }

            self[key] = value;
        }
    }
}

function setup(app, container)
{
    container.createContext = function(obj, x, y)
    {
        return new Context(obj, x, y);
    }

    let global_context = {}
    let permanent_context;
    let mouse_context = null;

    container.mergeGlobalContext = function(obj)
    {
        merge(global_context, obj);
    }

    function loadPermanentContent()
    {
        permanent_context = new PermanentContext(global_context, 0, 0);
    }

    function loadContext()
    {
        let rect = app.canvas.getBoundingClientRect();

        let mouseX = app.mouseX + rect.left;
        let mouseY = app.mouseY + rect.top;

        if(mouse_context !== null)
        {
            mouse_context.destroy();
        }

        let ctx = {};

        app.event.fire("context", {merge: merge.bind(null, ctx)})

        mouse_context = new MouseContext(ctx, mouseX, mouseY);
    }

    function handleWindowResize()
    {
        if(mouse_context !== null)
        {
            mouse_context.position();
        }
        permanent_context.position();
    }

    app.event.addEventListener("afterload", loadPermanentContent);
    app.event.addEventListener("raisecontext", loadContext);
    app.event.addEventListener("click", function()
    {
        if(mouse_context !== null)
        {
            mouse_context.destroy();
        }
        permanent_context.destroy();
    });

    window.addEventListener("resize", handleWindowResize);
}

export {setup};