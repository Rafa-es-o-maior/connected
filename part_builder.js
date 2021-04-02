const fs = require('fs');

function parseDirectory(path, bound)
{
    let ret = [];

    let files = fs.readdirSync(path);

    for(let i = 0; i < files.length; i++)
    {
        let file = files[i];

        let full_path = path + "/" + file;
            
        let stats = fs.lstatSync(full_path)

        if(stats.isDirectory())
        {
            ret.push(...parseDirectory(full_path, bound + "/" + file));
        }
        else
        {
            ret.push(bound + "/" + file);
        }
    }

    return ret;
}

let files = parseDirectory("./src/part", "")

fs.writeFileSync("./dist/part/parts.txt", files.join("\n"))