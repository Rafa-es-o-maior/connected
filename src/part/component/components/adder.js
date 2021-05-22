import ComponentBuilder from "../../../../map/component.js";
import { Listener, Emitter } from "../../../../map/component.js";

class HalfAdder extends ComponentBuilder
{
    build(component)
    {
        component.width = 2;
        component.height = 2;
        component.addInteractor(Listener, "A", 0, 0);
        component.addInteractor(Listener, "B", 0, 1);
        
        component.addInteractor(Emitter, "output", 1, 0);
        component.addInteractor(Emitter, "carry", 1, 1);
    }


    evaluate(component)
    {
        let val = component.interactors.A.state + component.interactors.B.state;

        component.interactors.output.setState(val & 0b1);
        component.interactors.carry.setState(val & 0b10);
    }
}

class FullAdder extends ComponentBuilder
{
    build(component)
    {
        component.width = 2;
        component.height = 3;

        component.addInteractor(Listener, "C", 0, 0);
        component.addInteractor(Listener, "A", 0, 1);
        component.addInteractor(Listener, "B", 0, 2);
        
        component.addInteractor(Emitter, "output", 1, 0);
        component.addInteractor(Emitter, "carry", 1, 1);
    }


    evaluate(component)
    {
        let val = component.interactors.A.state + component.interactors.B.state + component.interactors.C.state;

        component.interactors.output.setState(val & 0b1);
        component.interactors.carry.setState(val & 0b10);
    }
}

function setup(app, container)
{
    app.component.registerComponent("builtin:halfadder", new HalfAdder("Half Adder"));
    app.component.registerComponent("builtin:fulladder", new FullAdder("Full Adder"));
}

export {setup};