function callIf(obj, name, ...args)
{
    if(obj !== null)
    {
        let func = obj[name];
        if(func !== undefined)
        {
            return func.apply(obj, args);
        }
    }
}

function setup(app, container)
{
    let current = {left: null, right: null};
    let toolUsed = null;

    let placementTool = null;

    let tn = (isLeft) => (isLeft? "left" : "right");

    container.clearTool = function(isLeft)
    {
        let tool = current[tn(isLeft)];
        if(tool !== null)
        {
            current[tn(isLeft)] = null;
        }
    }

    container.setTool = function(tool, isLeft)
    {
        container.clearTool(isLeft);
        current[tn(isLeft)] = tool;
    }

    container.setPlacementTool = function(tool)
    {
        placementTool = tool;
    }

    container.addToolToPool = function(tool)
    {
        tools.push(tool);
    }

    let tools = [];

    function dispatchClickMouseEvent(ev)
    {
        if(placementTool === null)
        {
            let masked = app.buttons & 0b11;
            if(masked === 0b11)
            {
                // both are pressed; abort
                callIf(toolUsed, "cancel");
                toolUsed = null;
            }
            else if(ev.button !== 1)
            {
                let prop = ((app.buttons & 1) == 1)? "left" : "right";
                toolUsed = current[prop];
                callIf(toolUsed, "begin");
            }
        }
        else
        {
            if(ev.button === 0)
            {
                if(callIf(placementTool, "finish", ev))
                {
                    placementTool = null;
                }
            }
            else if(ev.button == 2)
            {
                callIf(placementTool, "cancel", ev);
                placementTool = null;
            }
        }
    }

    function dispatchUpMouseEvent(ev)
    {
        let masked = app.buttons & 0b11;

        if(masked == 0)
        {
            callIf(toolUsed, "finish", ev);
            toolUsed = null;
        }
    }

    function dispatchMoveMouseEvent(ev)
    {
        if(placementTool === null)
        {
            if((app.buttons & 0b11) > 0)
            {
                callIf(toolUsed, "move", ev);
            }
        }
    }

    function dispatchDrawMouseEvent(ev)
    {
        callIf(placementTool || toolUsed, "draw", ev);
    }

    function dispatchWheelMouseEvent(ev)
    {
        console.log(ev);
        callIf(placementTool || toolUsed, "wheel", ev);
    }

    app.event.addEventListener("click", dispatchClickMouseEvent);
    app.event.addEventListener("up", dispatchUpMouseEvent);
    app.event.addEventListener("move", dispatchMoveMouseEvent);
    app.event.addEventListener("wheel", dispatchWheelMouseEvent);
    app.event.addEventListener("draw", dispatchDrawMouseEvent, 0);
}


export {setup};