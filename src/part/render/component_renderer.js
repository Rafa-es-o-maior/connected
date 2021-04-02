function setup(app)
{
    function draw()
    {
        let bounds = app.world.math.visibleBounds();

        let components = app.world.loadedWorld.components;

        for(let component of components)
        {
            app.component.renderComponentAt(component, component.x, component.y);
        }
    }

    app.event.addEventListener("draw", draw, 1);
}

const requiring = ["world"];

export {setup, requiring};