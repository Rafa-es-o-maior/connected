import Component from "../../../../map/component.js";
import { Layout, Listener, Emitter } from "../../../../map/component.js";

class NOTGate extends Component
{
    static name = "NOT Gate"
    getLayout()
    {
        return new Layout(2, 1, [Listener.positioned("input", 0, 0),
        Emitter.positioned("output", 1, 0)])
    }

    evaluate()
    {
        this.interactors.output.setState(!this.interactors.input.state);
        return true;
    }
}

function setup(app, container)
{
    app.component.registerComponent("builtin:notgate", NOTGate);
}

export {setup};