function setup(app)
{
    let stepback = {x: 0, y: 0};
    let stepbackTimeout = 1000;

    function move(ev)
    {
        if(app.buttons & 0b100)
        {
            let multiplier = ev.ctrlKey?3:1;
            
            app.pan.x += ev.movementX * multiplier;
            app.pan.y += ev.movementY * multiplier;


            // hard limit
            
            app.pan.x = Math.max(app.pan.x, -app.world.loadedWorld.map.width * app.tilesize + app.canvas.width - app.width + app.tilesize);
            app.pan.x = Math.min(app.pan.x, app.width - app.tilesize);

            app.pan.y = Math.max(app.pan.y, -app.world.loadedWorld.map.height * app.tilesize + app.canvas.height - app.height + app.tilesize);
            app.pan.y = Math.min(app.pan.y, app.height - app.tilesize);


            // soft limit

            let desiredX = Math.max(app.pan.x, -app.world.loadedWorld.map.width * app.tilesize + app.canvas.width - 10);
            desiredX = Math.min(desiredX, 10);

            stepback.x = desiredX - app.pan.x;

            let desiredY = Math.max(app.pan.y, -app.world.loadedWorld.map.height * app.tilesize + app.canvas.height - 10);
            desiredY = Math.min(desiredY, 10);

            stepback.y = desiredY - app.pan.y;
        }
    }

    function stepbackF(ev)
    {
        if(app.buttons === 0)
        {
            let force = 0;
            if(stepbackTimeout < 0)
            {
                force = 0.1;
            } else if(stepbackTimeout < 500)
            {
                force = 0.0005;
            }

            let stepbackXAmount = stepback.x * force;
            let stepbackYAmount = stepback.y * force;

            app.pan.x += stepbackXAmount;
            app.pan.y += stepbackYAmount;

            stepback.x -= stepbackXAmount;
            stepback.y -= stepbackYAmount;

            if(stepbackTimeout >= 0)
            {
                stepbackTimeout -= ev.delta;
            }
        }
        else
        {
            stepbackTimeout = 1000;
        }
    }

    app.event.addEventListener("tick", stepbackF);
    app.event.addEventListener("move", move);
}


export {setup};