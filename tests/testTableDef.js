var fs = require('fs');


var tableDef = JSON.parse(fs.readFileSync("F:/my documents/_git/qmcu-brundle-fly/data/tableDef.json"));

//console.log(tableDef);

var foo = tableDef.columns.filter(function(item)
{
    return item.columnType === "Property";
})

console.log(foo);
