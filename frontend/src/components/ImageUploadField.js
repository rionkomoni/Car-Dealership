import { useState } from "react";
import api from "../api";
import { useAppToast } from "./ui/AppToastProvider";

export default function ImageUploadField({
  label,
  multiple = false,
  onUploaded,
  hint,
}) {
  const [uploading, setUploading] = useState(false);
  const { showToast } = useAppToast();

  async function handleChange(e) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const form = new FormData();
      if (multiple) {
        [...files].forEach((f) => form.append("images", f));
        const { data } = await api.post("/api/uploads/car-images", form);
        const paths = (data.files || []).map((f) => f.path);
        onUploaded(paths, data);
        showToast(data.message || "Imazhet u ngarkuan.", "success");
      } else {
        form.append("image", files[0]);
        const { data } = await api.post("/api/uploads/car-image", form);
        onUploaded(data.path, data);
        showToast("Imazhi kryesor u ngarkua.", "success");
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || err.message || "Ngarkimi dështoi.",
        "error"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="field-label image-upload-field">
      {label}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        disabled={uploading}
        onChange={handleChange}
        className="field-input"
      />
      {uploading ? <span className="muted small">Duke ngarkuar…</span> : null}
      {hint ? <span className="muted small">{hint}</span> : null}
    </label>
  );
}
