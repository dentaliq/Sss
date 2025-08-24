export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/submit" && request.method === "POST") {
      const contentType = request.headers.get("content-type") || "";
      let name = "";
      let ageRaw = "";

      if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
        const form = await request.formData();
        name = (form.get("name") || "").toString().trim();
        ageRaw = (form.get("age") || "").toString().trim();
      } else if (contentType.includes("application/json")) {
        const body = await request.json().catch(() => ({}));
        name = (body.name || "").toString().trim();
        ageRaw = (body.age || "").toString().trim();
      } else {
        return new Response("Unsupported Content-Type", { status: 415 });
      }

      const age = Number(ageRaw);
      const errors = [];
      if (!name || name.length < 2 || name.length > 80) errors.push("الاسم غير صالح (2–80 حرفاً).");
      if (!ageRaw || Number.isNaN(age) || age < 1 || age > 120) errors.push("العمر يجب أن يكون بين 1 و 120.");

      if (errors.length) {
        return new Response(errors.join(" | "), { status: 400 });
      }

      return new Response(JSON.stringify({ ok: true, data: { name, age } }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  },
};
