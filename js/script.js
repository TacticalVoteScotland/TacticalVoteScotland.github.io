document.addEventListener("DOMContentLoaded", () => {

// Grab form element from page
const form = document.querySelector("#postcode")
const splash = document.querySelector("#splash")
const resetLink = document.querySelector("#resetLink")
const message = document.querySelector("#message")
const error = document.querySelector("#error")
const outcome = document.querySelector("#infoBox")
const constituency = document.querySelector("#constituency")
const region = document.querySelector("#region")
const recommendation = document.querySelector("#recommendation")
const loading = document.querySelector("#loading")
const infoBox = document.querySelector("#infoBox")
const restartButton = document.querySelector("#restartButton");

let constituencyString
let graphicsGenerated = 0;

// Capture form data
  window.addEventListener("load", function() {
  form.addEventListener("submit", function(e) {
    const captureData = new FormData(form);
    const action = e.target.action;
    fetch(action, {
      method: 'POST',
      body: captureData,
    })
  });
});

function reset() {
  location.reload();
}

restartButton.addEventListener("click", reset);

// Converts any images in the target area to 64-bit data so html2canvas can read them properly
function imageSrcToBase64(img) {
  const isBase64 = /^data:image\/(png|jpeg);base64,/.test(img.src);
  if (isBase64) {
    return;
  }
  return fetch(img)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = reject;
          reader.onload = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(blob);
        })
    )
    .then((dataURL) => {
      img.src = dataURL;
    });
}

// Creates a canvas from the targeted page element (in this case #infoBox) then creates a preview for the user at the specified width and height and calls the image download function.
function generateGraphic() {

  infoBox.style.background = document.defaultView.getComputedStyle(document.body).background;

  html2canvas(document.querySelector("#infoBox"), {

    windowWidth: 1440,
    width: infoBox.width,
    windowHeight: 1080,
    height: infoBox.height,

  }, {scale: '3'}).then(canvas => {
      canvas.id = `graphic${graphicsGenerated}`;
      document.getElementById('graphicOutput').appendChild(canvas);
      document.getElementById(`graphic${graphicsGenerated}`).style="display:none";
      imgPreview = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      download_image();
  });

  infoBox.style.background = "none";

}

// Creates the PNG file and downloads it through the user's browser.
function download_image() {
  let download = document.getElementById(`graphic${graphicsGenerated}`);
  image = download.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement('a');
  link.download = `Tactical Voting Recommendation - ${constituency.textContent}.png`;
  link.href = image;
  link.click();
  document.getElementById('refreshLink').style.display = 'block';
  document.getElementById('graphicOutput').removeChild(canvas);
}

let graphicButton = document.getElementById('graphicButton');
graphicButton.addEventListener("click", generateGraphic);

form.addEventListener("submit", e => {
  // Stop page refreshing
  e.preventDefault()

  // Make form data accessible as JS variable
  let formData = new FormData(form)
  let postcode = formData.get("postcode")

  function printMessageToScreen(constituencyString, regionString){
  fetch(`https://tacticalvotescotland.uk/js/constituencies.json`)
      .then(res => res.json())
      .then(data => {
      console.log(data);
      if(constituencyString == undefined) {
        error.style.display = "block";
        error.innerHTML = "Sorry, looks like that's an invalid postcode.";
      } else {
        loading.style.display = "block";
        error.style.display = "none";
        constituency.innerHTML = constituencyString;
        region.innerHTML = regionString;
        recommendation.innerHTML = data[constituencyString].recommended;
        switch(data[constituencyString].recommended) {
          case "Labour":
            document.body.style['background-color'] = "#e4003b";
            break;
          case "Conservative":
            document.body.style['background-color'] = "#00b0f0";
            break;
          case "Liberal Democrat":
            document.body.style['background-color'] = "#FAA61A";
            break;
        }
        document.getElementById('twtLink').href=`https://twitter.com/intent/tweet?text=If%20you%20want%20to%20stop%20the%20SNP%20in%20${constituencyString},%20your%20best%20chance%20is%20to%20vote%20${data[constituencyString].recommended}.%20Check%20your%20constituency%20here%20%F0%9F%97%B3%EF%B8%8F%20https%3A//tacticalvotescotland.uk`;
        document.getElementById('bsLink').href=`https://bsky.app/intent/compose?text=If%20you%20want%20to%20stop%20the%20SNP%20in%20${constituencyString},%20your%20best%20chance%20is%20to%20vote%20${data[constituencyString].recommended}.%20Check%20your%20constituency%20here%20%F0%9F%97%B3%EF%B8%8F%20https%3A//tacticalvotescotland.uk`;
        document.getElementById('waLink').href=`https://api.whatsapp.com/send?text=If%20you%20want%20to%20stop%20the%20SNP%20in%20${constituencyString}%2C%20your%20best%20chance%20is%20to%20vote%20${data[constituencyString].recommended}.%20Check%20your%20constituency%20here%20%F0%9F%97%B3%EF%B8%8F%20https%3A%2F%2Ftacticalvotescotland.uk`;
        outcome.style.display = "block";
        splash.style.display = "none";
        loading.style.display = "none";
        restartButton.style.display= "block";
  }}
            )
  }

function getConstituencyName(postcode) {
  fetch(`https://mapit.mysociety.org/postcode/${postcode}?api_key=ymM4j2aeGa1sPXpv4c8ypaS2YaSRB2ZvpKGptsUt`)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      let sortedData = Object.keys(data.areas);
      let oldConstituencyData = data.areas[sortedData[6]].name;
      let newConstituencyData = data.areas[sortedData[7]].name;
      let region = data.areas[sortedData[8]].name;
      console.log(newConstituencyData);
      console.log(data.areas[sortedData[7]].country);
      outcome.style.display = "none";
      if(data.code == 400) {
        error.innerHTML = "Sorry, looks like that's an invalid postcode."
        error.style.display = "block";
      } else if(data.areas[sortedData[7]].country != "S") {
        error.innerHTML = "Sorry, looks like that postcode isn't in Scotland."
        error.style.display = "block";
      } else {
        if (oldConstituencyData != newConstituencyData) {
          error.innerHTML = "Your constituency may have changed since the last Scottish Parliament election in 2021."
          error.style.display = "block";
        }
      let constituencyName = newConstituencyData;
      let constituencyString = constituencyName.toString();
      let regionString = region.toString();
      printMessageToScreen(constituencyString, regionString)
      }
    }
    )
}

getConstituencyName(postcode);

})

})
