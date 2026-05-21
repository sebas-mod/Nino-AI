import config from "../../config.js";

const OBS_KEY = config.APIkey.obscura;

async function uploadBuf(buf) {
  const f = new FormData();
  f.append("file", new Blob([buf]), "img.jpg");
  const r = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: f,
  });
  const j = await r.json();
  return j.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
}

async function live3d(
  imageBuffer,
  prompt = "Make this person the skin is very black, but skin tone still natural",
) {
  const imgUrl = await uploadBuf(imageBuffer);
  const r = await fetch(
    `https://api.obscuraworks.org/api/tools/edit-image?url=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`,
    {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${OBS_KEY}`,
      },
    },
  );
  if (!r.ok) throw new Error("Gagal mengedit gambar");
  const image = Buffer.from(await r.arrayBuffer());
  return { image };
}

async function fluxImage(message, ratio = "1:1") {
  const response = await fetch("https://api.yuulabs.web.id/api/ai/flux-img", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      ratio,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data?.status || !data?.result?.url) {
    throw new Error(data?.message || data?.error || "Gagal membuat gambar");
  }

  return data.result;
}

export { live3d, fluxImage };
