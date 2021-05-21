import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";

class Component2Operations extends ComponentBuilder
{
    build(component)
    {
        component.width = 2;
        component.height = 2;
        component.addInteractor(Listener, "input1", 0, 0);
        component.addInteractor(Listener, "input2", 0, 1);
        component.addInteractor(Emitter, "output", 1, 0);
    }
}

class ANDGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input1.state && component.interactors.input2.state);
    }
}

class NANDGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(!(component.interactors.input1.state && component.interactors.input2.state));
    }
}

class ORGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input1.state || component.interactors.input2.state);
    }
}

class NORGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(!(component.interactors.input1.state || component.interactors.input2.state));
    }
}

class XORGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input1.state !== component.interactors.input2.state);
    }
}

class XNORGate extends Component2Operations
{
    evaluate(component)
    {
        component.interactors.output.setState(component.interactors.input1.state === component.interactors.input2.state);
    }
}

function setup(app, container)
{
    app.component.registerComponent("builtin:andgate", new ANDGate("AND Gate"));
    app.component.registerComponent("builtin:nandgate", new NANDGate("NAND Gate"));
    app.component.registerComponent("builtin:orgate", new ORGate("OR Gate"));
    app.component.registerComponent("builtin:norgate", new NORGate("NOR Gate"));
    app.component.registerComponent("builtin:xorgate", new XORGate("XOR Gate"));
    app.component.registerComponent("builtin:xnorgate", new XNORGate("XNOR Gate"));
}
export {setup};