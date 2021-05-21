function setup(app, container)
{
    app.context.mergeGlobalContext({
        simulation: function()
        {
            if(app.world.loadedWorld.running)
            {
                return {stop: function(){
                    app.world.loadedWorld.stop();
                }}
            }
            else
            {
                return {run: function(){
                    app.world.loadedWorld.prepareRun();
                }}
            }
        }
    })

    function tick()
    {
        if(app.world.loadedWorld.running)
        {
            app.world.loadedWorld.tick();
        }
    }

    function componentClick(ev)
    {
        if(app.world.loadedWorld.running)
        {
            let pos = app.world.math.screenToPosition(app.mouseX, app.mouseY);

            let components = app.world.loadedWorld.components;

            for(let component of components)
            {
                let rotatedSize = component.rotatedSize;
                if(component.x <= pos.x && component.x + rotatedSize.x > pos.x &&
                    component.y <= pos.y && component.y + rotatedSize.y > pos.y)
                {
                    component.builder.click(component);
                }
            }

            ev.cancel();
        }
    }

    app.event.addEventListener("click", componentClick, 1);
    app.event.addEventListener("tick", tick);
}

const requiring = ["world", "context"]

export {setup, requiring};