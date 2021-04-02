import Component from "../../../../map/component.js";
import { Layout, Listener, Emitter } from "../../../../map/component.js";

class Timeout extends Component
{
    static name = "Timeout Gate"

    constructor(world, x, y, layout)
    {
        super(world, x, y, layout);
        this.thread = null;
    }

    getLayout()
    {
        return new Layout(2, 1, [Listener.positioned("input", 0, 0),
        Emitter.positioned("output", 1, 0)])
    }


    evaluate()
    {
        let setting = this.interactors.input.state;

        setTimeout(()=>{
            this.interactors.output.setState(setting);
            this.invalidate();
        }, 1000);

        return true;
    }
}

function setup(app, container)
{
    app.component.registerComponent("builtin:timeoutgate", Timeout);
}

export {setup};