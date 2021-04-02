import Component from "../../../../map/component.js";
import { Layout, Listener, Emitter } from "../../../../map/component.js";

class ORGate extends Component
{
    static name = "OR Gate"
    getLayout()
    {
        return new Layout(2, 2, [Listener.positioned("input1", 0, 0),
        Listener.positioned("input2", 0, 1),
        Emitter.positioned("output", 1, 0)])
    }

    evaluate()
    {
        this.interactors.output.setState(this.interactors.input1.state || this.interactors.input2.state);
        return true;
    }
}

function setup(app, container)
{
    app.component.registerComponent("builtin:orgate", ORGate);
}

export {setup};