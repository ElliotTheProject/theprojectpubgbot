const { Client, Intents } = require("discord.js");
const Discord = require("discord.js");
const Canvas = require("canvas");
const Font = Canvas.Font;
const { default: file } = require("@babel/core/lib/transformation/file/file");
const apikey = API_KEY;
const client = new Discord.Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
let pdata = [];
let space = [];
const { readFile } = require("fs/promises");
const { registerFont, createCanvas } = require("canvas");
const { stat } = require("fs");
registerFont("MarkProBold.otf", { family: "MarkPro" });
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
  if (msg.content.indexOf("!p") > -1) {
    for (let i = 0; i < msg["content"].length; i++) {
      if (msg["content"][i] == " ") {
        space.push(i);
      }
    }
    let platform = msg["content"].substring(space[0] + 1, space[1]);
    let ign = msg["content"].substring(space[1] + 1, msg["content"].length);
    if (
      platform == "steam" ||
      platform == "kakao" ||
      platform == "xbox" ||
      platform == "psn" ||
      platform == "stadia"
    ) {
      pubg(ign, platform, msg);
    } else {
      msg.reply("Please enter a vailed platform");
    }
    space = [];
    pdata = [];
  }
  if (msg.content.toLowerCase() == "exit") {
    client.destroy();
    process.exit();
  }
});
function pubg(ign, platform, msg) {
  let accid = null;
  let data = fetch(
    `https://api.pubg.com/shards/${platform}/players?filter[playerNames]=${ign}`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${apikey}`,
      },
    }
  );
  data
    .then((response) => response.json())
    .then((data) => (accid = data["data"][0]["id"]))
    .then((data) => lifetime(accid, ign, platform, msg))
    .catch((err) => msg.reply("Please Check Your PUBG IGN"));
}
function lifetime(accid, ign, platform, msg) {
  let lifetimedata = fetch(
    `https://api.pubg.com/shards/${platform}/players/${accid}/seasons/lifetime`,
    {
      headers: {
        accept: "application/vnd.api+json",
        Authorization: `Bearer ${apikey}`,
      },
    }
  );
  lifetimedata
    .then((response) => response.json())
    .then((data) => pdata.push(data["data"]["attributes"]["gameModeStats"]))
    .then((data) => set_values(msg, ign));
}
function set_values(msg, ign) {
  let type = ["solo", "solo-fpp", "duo", "duo-fpp", "squad", "squad-fpp"];
  let needs = [
    "dBNOs",
    "damageDealt",
    "headshotKills",
    "kills",
    "longestKill",
    "rideDistance",
    "swimDistance",
    "walkDistance",
    "wins",
    "roundsPlayed",
    "timeSurvived",
  ];
  let datas = [[], [], [], [], [], [], [], [], [], [], []];
  for (let i = 0; i < type.length; i++) {
    for (let j = 0; j < needs.length; j++) {
      datas[j].push(pdata[0][type[i]][needs[j]]);
    }
  }
  let dbno = datas[0].reduce((a, b) => a + b);
  let dmg = datas[1].reduce((a, b) => a + b);
  let hkill = datas[2].reduce((a, b) => a + b);
  let kill = datas[3].reduce((a, b) => a + b);
  let longestKill = Math.max.apply(null, datas[4]);
  let rd = datas[5].reduce((a, b) => a + b);
  let sd = datas[6].reduce((a, b) => a + b);
  let wd = datas[7].reduce((a, b) => a + b);
  let wins = datas[8].reduce((a, b) => a + b);
  let round = datas[9].reduce((a, b) => a + b);
  let playtime = datas[10].reduce((a, b) => a + b);
  let dmgaver = dmg / round;
  let kda = kill / round;
  let stat = {
    dbno: dbno,
    dmg: dmg.toFixed(1),
    hkill: hkill,
    kill: kill,
    lkill: `${longestKill.toFixed(1)}M`,
    rd: `${(rd / 1000).toFixed(1)}KM`,
    sd: `${(sd / 1000).toFixed(1)}KM`,
    wd: `${(wd / 1000).toFixed(1)}KM`,
    win: wins,
    round: round,
    dmgaver: dmgaver.toFixed(1),
    kda: kda.toFixed(1),
    hkillratio: `${((hkill / kill) * 100).toFixed(1)}%`,
    playtime: `${Math.round(playtime / 3600)}H`,
  };
  datas = [];
  render(ign, msg, stat);
}

async function render(ign, msg, stat) {
  const canvas = Canvas.createCanvas(1920, 1080);
  const ctx = canvas.getContext("2d");
  const backgroundFile = await readFile("./background.png");
  const background = new Canvas.Image();
  background.src = backgroundFile;
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  //ign
  ctx.font = "150px MarkPro";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(ign, canvas.width / 17, canvas.height / 6);
  //tr1
  ctx.font = "65px MarkPro";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(stat["dmg"], canvas.width / 21, canvas.height / 2.5);
  ctx.fillText(stat["dmgaver"], canvas.width / 3.4, canvas.height / 2.5);
  ctx.fillText(stat["dbno"], canvas.width / 1.6, canvas.height / 2.5);
  ctx.fillText(stat["playtime"], canvas.width / 1.25, canvas.height / 2.5);
  //tr2
  ctx.font = "65px MarkPro";
  ctx.fillText(stat["kill"], canvas.width / 21, canvas.height / 1.6);
  ctx.fillText(stat["hkill"], canvas.width / 5.5, canvas.height / 1.6);
  ctx.fillText(stat["lkill"], canvas.width / 2.3, canvas.height / 1.6);
  ctx.fillText(stat["hkillratio"], canvas.width / 1.45, canvas.height / 1.6);
  ctx.fillText(stat["kda"], canvas.width / 1.08, canvas.height / 1.6);
  //tr3
  ctx.font = "65px MarkPro";
  ctx.fillText(stat["wd"], canvas.width / 21, canvas.height / 1.13);
  ctx.fillText(stat["rd"], canvas.width / 3.5, canvas.height / 1.13);
  ctx.fillText(stat["sd"], canvas.width / 1.9, canvas.height / 1.13);
  ctx.fillText(stat["win"], canvas.width / 1.33, canvas.height / 1.13);
  ctx.fillText(stat["round"], canvas.width / 1.16, canvas.height / 1.13);
  // Use the helpful Attachment class structure to process the file for you
  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer("image/png"),
    `${ign} PUBG STAT.png`
  );

  msg.reply({ files: [attachment] });
}

client.login(TOKEN);
