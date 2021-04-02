import Component from "../../../../map/component.js";
import { Layout, Listener, Emitter } from "../../../../map/component.js";

class UserInput extends Component
{
    constructor(world, x, y, layout)
    {
        super(world, x, y, layout);
        this.clicked = false;
    }

    getLayout()
    {
        return new Layout(1, 1, [Emitter.positioned("output", 0, 0)])
    }

    evaluate()
    {
        this.interactors.output.setState(this.clicked);
        return true;
    }
}

class Switch extends UserInput
{
    static name = "Switch"

    click()
    {
        this.clicked = !this.clicked;
        this.invalidate();
    }
}

class Button extends UserInput
{
    static name = "Button"

    constructor(world, x, y, layout)
    {
        super(world, x, y, layout);
        this.thread = null;
    }

    click()
    {
        this.clicked = true;
        this.invalidate();

        if(this.thread !== null)
        {
            clearTimeout(this.thread);
        }

        this.thread = setTimeout(()=>{
            this.clicked = false;
            this.invalidate();
        }, 100);
    }
}


function setup(app, container)
{
    app.component.registerComponent("builtin:switch", Switch);
    app.component.registerComponent("builtin:button", Button);
}

export {setup};