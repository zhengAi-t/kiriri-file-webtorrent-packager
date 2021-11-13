import fs from 'fs';
/** cmd参数形式，成功返回 */
function cmd(){
  let argvs=process.argv.slice(2);
  argvs=argvs.map(s=>s.trimStart().slice(2).split('='));
  let input;
  if(argvs[0]&&argvs[0][0]==='input')input=argvs[0][1];
  else if(argvs[1]&&argvs[1][0]==='input')input=argvs[1][1];
  let output;
  if(argvs[0]&&argvs[0][0]==='output')output=argvs[0][1];
  else if(argvs[1]&&argvs[1][0]==='output')output=argvs[1][1];
  if(!input||!output)return false;
  return pack(input,output);
}
/** 双击模式打开 */
function dbclick(){
  /** 标准的目录结构 */
  let standrd={'se':1,'bgm':1,'cv':1,'bg':1,'cg':1,'mask':1,'ui':1,'storys':1,'story':1};
  let dir=fs.readdirSync('./');
  let cnt=0;
  dir.forEach(s=>standrd[s]?cnt++:undefined);
  if(cnt<3)return false;
  return pack('./','./');
}
import readline from 'readline';
function question(string){
  let typer=readline.createInterface({input:process.stdin,output:process.stdout});
  return new Promise(rs=>typer.question(string,s=>rs(s)));
}
async function manual(){
  let input=await question('需要打包的游戏路径\n');
  let output=await question('保存文件的位置\n');
  return pack(input,output);
}
/** 打包指定路径并输出到指定位置 */
async function pack(input,output){
  output=output+'/game.pak';
  //获取目录结构
  let files=[],offset=0,stream;
  try{
    getFiles('');
    stream=fs.createWriteStream(output);
    stream.write(JSON.stringify(files));
    stream.write('\0\0\0\0\0\0');
    await marge();
    stream.close(()=>process.exit(0));
    return true;
  }catch(e){
    console.log(e);
    return false;
  }
  function getFiles(packPath){
    let stat=fs.statSync(input+'/'+packPath);
    if(stat.isFile()){
      files.push({name:packPath,offset,length:stat.size});
      offset+=stat.size;
      return;
    }
    let dir=fs.readdirSync(input+'/'+packPath);
    for(let i=0;i<dir.length;i++){
      getFiles(packPath+'/'+dir[i]);
    }
  }
  async function marge(){
    for(let i=0;i<files.length;i++){
      let filename=input+'/'+files[i].name;
      let file=fs.readFileSync(filename);
      stream.write(file);
    }
  }
}
(async function(){
  let choice=[cmd,dbclick,manual];
  for(let i=0;i<3;i++){
    try{
      if(await choice[i]())return;
    }catch{
      ;
    }
  }
})();