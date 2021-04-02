import { PriorityEventMapping } from "./event.js";
import Loader from "./loader.js";


class Application
{
    constructor(root)
    {
        this.event = new PriorityEventMapping();

        this.root = root;
        this.canvas = document.createElement("canvas");

        this.root.appendChild(this.canvas);

        this.canvas.width = this.root.offsetWidth;
        this.canvas.height = this.root.offsetHeight;

        this.ctx = this.canvas.getContext("2d");

        this.mouseX = 0;
        this.mouseY = 0;
        this.buttons = 0;

        let dragging = false;
        let inside = false;
        let shouldRaiseContext = false;

        this.canvas.addEventListener("mousedown", (ev)=>{
            dragging = true;
            shouldRaiseContext = ev.buttons === 4;

            this.updateMousePosition(ev.pageX, ev.pageY);
            this.buttons = ev.buttons;
            this.event.fire("click", ev);

            ev.preventDefault();
            
             return false;
        });

        this.canvas.addEventListener("mouseenter", function()
        {
            inside = true;
        });

        this.canvas.addEventListener("mouseleave", (ev)=>{inside = false; shouldRaiseContext = false;});

        this.canvas.addEventListener("contextmenu", (ev)=>ev.preventDefault());

        this.canvas.addEventListener("wheel", this.event.delegate("wheel"));

        this.canvas.addEventListener("mousemove",  (ev)=>{
            if(dragging || inside)
            {
                if(Math.abs(ev.movementX) + Math.abs(ev.movementY) > 3)
                {
                    shouldRaiseContext = false;
                }

                this.updateMousePosition(ev.pageX, ev.pageY);

                this.event.fire("move", ev);
            }
        });

        window.addEventListener("keydown", this.event.delegate("keydown"));

        window.addEventListener("keyup", this.event.delegate("keyup"));

        window.addEventListener("mouseup", (ev)=>{
            this.updateMousePosition(ev.pageX, ev.pageY);

            this.buttons = ev.buttons;
            
            if(dragging)
                this.event.fire("up", ev);
            if(ev.buttons === 0)
                dragging = false;
        

            if(inside && shouldRaiseContext)
                this.event.fire("raisecontext");
        });

        window.addEventListener("resize", ()=>
        {
            if(this.root.offsetWidth !== this.canvas.width || this.root.offsetHeight !== this.canvas.height)
            {
                this.canvas.width = this.root.offsetWidth;
                this.canvas.height = this.root.offsetHeight;
                dispatch_draw();
            }
        })

        let last_tick;
        let last_draw;

        let dispatch_tick = ()=>
        {
            let stamp = new Date().getTime();

            this.event.fire("tick", {delta: stamp - last_tick});
            last_tick = stamp;
        }

        let dispatch_draw = ()=>
        {
            let stamp = new Date().getTime();

            this.event.fire("draw", {delta: stamp - last_draw});
            last_draw = stamp;
        }

        let begin = ()=>
        {
            let stamp = new Date().getTime();

            dispatch_tick();
            dispatch_draw();
            
            requestAnimationFrame(begin);
        }

        let launcher = ()=>
        {
            this.event.fire("afterload");
            last_tick = last_draw = new Date().getTime();
            begin();
        }

        this.loader = new Loader(this);
        this.loader.queueFile("./part/parts.txt", "")
        this.loader.start().then(launcher);
    }

    get width()
    {
        return this.canvas.width;
    }

    get height()
    {
        return this.canvas.height;
    }

    updateMousePosition(pageX, pageY)
    {
        let rect = this.canvas.getBoundingClientRect();
        this.mouseX = pageX - rect.left;
        this.mouseY = pageY - rect.top;
    }
}
window.addEventListener("load", function()
{
    let root = document.createElement("div");

    document.getElementById("root").appendChild(root);

    root.style.width = "100vw";
    root.style.height = "100vh";

    root.style.position = "relative";

    requestAnimationFrame(function()
    {
        let app = new Application(root);
    })
})
