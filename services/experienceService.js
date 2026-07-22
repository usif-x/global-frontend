// Mirror whatever base client / API_URL pattern divecenterService.js already
// uses — swap this out if you have a shared fetch wrapper.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ExperienceService {
  static async getAll() {
    const res = await fetch(`${API_URL}/experiences/`, {
      cache: "no-store", // admin adds/deletes media; don't serve stale gallery
    });
    if (!res.ok) throw new Error("Failed to fetch experiences");
    return res.json();
  }
}

export default ExperienceService;
