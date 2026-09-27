// Offline reproducible menu audit. Does not change user data or prescribe these menus.
const core=require('../nutrition-core'),catalog=require('../data/nutrition/foods.json'),menus=require('../data/nutrition/menu-candidates.json');
const refs={calcium:1000,iron:8,magnesium:400,potassium:3400,zinc:11,selenium:55,vitaminA:900,vitaminD:15,vitaminE:15,vitaminC:90,thiamin:1.2,riboflavin:1.3,niacin:16,vitaminB6:1.3,folate:400,vitaminB12:2.4,choline:550,vitaminK:120,iodine:150};
const report={status:menus.status,reference:'Adult male 19–30 RDA/AI; not an individualized diagnosis. See docs/NUTRITION_MODEL.md.',days:{}};
for(const [name,meals] of Object.entries(menus.days)){
 const n=core.totalIngredients(meals.flatMap(m=>m.ingredients),catalog);
 report.days[name]={meals:meals.map(m=>{const s=core.recipeSnapshot(m,catalog);return{name:m.name,kcal:Math.round(s.kcal),protein:Math.round(s.nutrients.protein.known)}}),nutrients:{}};
 for(const [key,v] of Object.entries(n))report.days[name].nutrients[key]={known:Math.round(v.known*10)/10,unit:v.unit,complete:v.complete,...(refs[key]?{reference:refs[key],finding:v.known>=refs[key]?'known subtotal meets reference':v.complete?'below reference':'unresolved; data incomplete'}:{})};
}
console.log(JSON.stringify(report,null,2));
