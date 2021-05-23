import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";
import { World } from "../../../../map/world.js";

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
    World.global_registry["builtin:andgate"] = new ANDGate("AND Gate");
    World.global_registry["builtin:nandgate"] = new NANDGate("NAND Gate");
    World.global_registry["builtin:orgate"] = new ORGate("OR Gate");
    World.global_registry["builtin:norgate"] = new NORGate("NOR Gate");
    World.global_registry["builtin:xorgate"] = new XORGate("XOR Gate");
    World.global_registry["builtin:xnorgate"] = new XNORGate("XNOR Gate");
}
export {setup};