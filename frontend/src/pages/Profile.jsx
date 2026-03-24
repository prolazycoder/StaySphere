import React, { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { profileApi } from "../api/profileApi";
import { useUser } from "../context/UserContext";
import "./Profile.css";

const emptyUser = {
  id: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  country: "",
  city: "",
  gender: "MALE",
  dob: "",
  profileImage: "",
};

// ✅ normalize date to yyyy-MM-dd (Spring LocalDate accepts this)
const normalizeToISODate = (value) => {
  if (!value) return "";

  // already ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // mm/dd/yyyy -> yyyy-mm-dd
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [mm, dd, yyyy] = value.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }

  // dd-mm-yyyy -> yyyy-mm-dd
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [dd, mm, yyyy] = value.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }

  return value;
};

// ✅ Get userId from localStorage OR decode from token and store it
const getUserIdFromTokenOrStorage = () => {
  const storedId = localStorage.getItem("userId");
  if (storedId) return storedId;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const id = payload?.userID; // ✅ YOUR CLAIM KEY

    if (id) {
      localStorage.setItem("userId", id);
      return id;
    }

    return null;
  } catch (err) {
    return null;
  }
};

export default function Profile() {
  const fileRef = useRef(null);

  // ✅ GLOBAL USER for Dashboard update
  const { setUser: setGlobalUser } = useUser();

  const [user, setUser] = useState(emptyUser);
  const [draft, setDraft] = useState(emptyUser);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const avatarText = useMemo(() => {
    const s = user.fullName?.trim();
    return s ? s[0].toUpperCase() : "U";
  }, [user.fullName]);

  // ============================
  // Load Profile
  // ============================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const userId = getUserIdFromTokenOrStorage();
        if (!userId) {
          setError("Session expired. Please login again.");
          return;
        }

        const res = await profileApi.getProfileById(userId);

        if (res?.status === false) {
          setError(res.message || "Profile not found.");
          return;
        }

        const data = res?.data || {};

        console.log("Profile Data received from API:", data);

        const normalized = {
          ...emptyUser,
          ...data,
          gender: data?.gender || "MALE", // Default to MALE if missing
          dob: normalizeToISODate(data?.dob || ""),
          profileImage: data?.profileImage || "",
        };

        console.log("Normalized Profile set to state:", normalized);

        setUser(normalized);
        setDraft(normalized);
        setGlobalUser(normalized);
      } catch (e) {
        console.error(e);
        setError("Failed to load profile. Check backend / token.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setGlobalUser]);

  // ============================
  // UI handlers
  // ============================
  const startEdit = () => {
    setError("");
    setDraft(user);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError("");
    setDraft(user);
    setIsEditing(false);
  };

  const onChange = (e) => {
    // Explicit debug to track what we're saving
    console.log(`Updating ${e.target.name} to:`, e.target.value);
    setDraft((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!draft.fullName?.trim()) return "Full name is required";
    if (!draft.email?.trim()) return "Email is required";

    const phone = String(draft.phoneNumber || "").trim();
    if (!phone.match(/^[0-9]{10}$/)) return "Phone number must be 10 digits";

    if (!draft.country?.trim()) return "Country is required";
    if (!draft.city?.trim()) return "City is required";
    if (!draft.gender) return "Gender is required";

    const dobISO = normalizeToISODate(draft.dob);
    if (!dobISO) return "DOB is required";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dobISO)) return "DOB must be yyyy-mm-dd";

    return "";
  };

  // ============================
  // Save profile
  // ============================
  const saveProfile = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        fullName: String(draft.fullName || "").trim(),
        email: String(draft.email || "").trim(),
        phoneNumber: String(draft.phoneNumber || "").trim(),
        country: String(draft.country || "").trim(),
        city: String(draft.city || "").trim(),
        gender: draft.gender,
        dob: normalizeToISODate(draft.dob),

        // ✅ IMPORTANT: send profileImage also
        profileImage: draft.profileImage || "",
      };

      const res = await profileApi.updateProfile(payload);

      if (res?.status === false) {
        setError(res.message || "Update failed.");
        return;
      }

      const updated = {
        ...draft,
        dob: normalizeToISODate(draft.dob),
      };

      setUser(updated);
      setDraft(updated);
      setIsEditing(false);

      // ✅ update global user so Dashboard updates
      setGlobalUser(updated);

      toast.success(res?.message || "Profile updated ✅");
    } catch (e) {
      console.error("AXIOS ERROR =>", e);
      console.log("BACKEND RESPONSE =>", e?.response?.data);

      const backendMsg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        JSON.stringify(e?.response?.data || {}) ||
        "Update failed";

      setError(backendMsg);
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // Upload image
  // ============================
  const pickImage = () => fileRef.current?.click();

  const uploadImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Max image size is 2MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      // ✅ 1) upload to server
      const url = await profileApi.uploadProfileImage(file);

      // ✅ 2) update UI instantly
      setUser((prev) => ({ ...prev, profileImage: url }));
      setDraft((prev) => ({ ...prev, profileImage: url }));
      setGlobalUser((prev) => ({ ...(prev || {}), profileImage: url }));

      // ✅ 3) IMPORTANT: SAVE URL IN DB (so refresh won't lose it)
      const payload = {
        fullName: String(draft.fullName || "").trim(),
        email: String(draft.email || "").trim(),
        phoneNumber: String(draft.phoneNumber || "").trim(),
        country: String(draft.country || "").trim(),
        city: String(draft.city || "").trim(),
        gender: draft.gender,
        dob: normalizeToISODate(draft.dob),
        profileImage: url,
      };

      await profileApi.updateProfile(payload);

      toast.success("Image uploaded & saved ✅");
    } catch (e) {
      console.error(e);
      const backendMsg =
        e?.response?.data?.message ||
        (typeof e?.response?.data === "string" ? e.response.data : null) ||
        "Upload failed";
      setError(backendMsg);
    } finally {
      setUploading(false);
    }
  };

  // ============================
  // Render
  // ============================
  if (loading) {
    return (
      <div className="profileWrap">
        <div className="profileCard">
          <p className="loadingText">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profileWrap">
      <div className="profileCard">
        {/* Header */}
        <div className="profileHeader">
          <div>
            <h2 className="profileTitle">Profile</h2>
            <p className="profileSubtitle">Update your personal details</p>
          </div>

          {!isEditing ? (
            <button className="btn btnPrimary" onClick={startEdit}>
              Edit Profile
            </button>
          ) : (
            <button
              className="btn btnGhost"
              onClick={cancelEdit}
              disabled={saving || uploading}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="avatarRow">
          <div className="avatar">
            {user.profileImage ? (
              <img src={user.profileImage} alt="profile" />
            ) : (
              <span>{avatarText}</span>
            )}
          </div>

          <div className="avatarRight">
            <button
              className="btn btnOutline"
              onClick={pickImage}
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
            <p className="hint">JPG/PNG max 2MB</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => uploadImage(e.target.files?.[0])}
          />
        </div>

        {/* Error */}
        {error && <div className="alertError">{error}</div>}

        {/* Form grid */}
        <div className="grid">
          <Field label="Full Name">
            {isEditing ? (
              <input
                className="input"
                name="fullName"
                value={draft.fullName}
                onChange={onChange}
              />
            ) : (
              <div className="value">{user.fullName || "-"}</div>
            )}
          </Field>

          <Field label="Email">
            {isEditing ? (
              <input
                className="input"
                name="email"
                value={draft.email}
                onChange={onChange}
              />
            ) : (
              <div className="value muted">{user.email || "-"}</div>
            )}
          </Field>

          <Field label="Phone Number">
            {isEditing ? (
              <input
                className="input"
                name="phoneNumber"
                value={draft.phoneNumber}
                onChange={onChange}
              />
            ) : (
              <div className="value">{user.phoneNumber || "-"}</div>
            )}
          </Field>

          <Field label="Country">
            {isEditing ? (
              <input
                className="input"
                name="country"
                value={draft.country}
                onChange={onChange}
              />
            ) : (
              <div className="value">{user.country || "-"}</div>
            )}
          </Field>

          <Field label="City">
            {isEditing ? (
              <input
                className="input"
                name="city"
                value={draft.city}
                onChange={onChange}
              />
            ) : (
              <div className="value">{user.city || "-"}</div>
            )}
          </Field>

          <Field label="Gender">
            {isEditing ? (
              <select
                className="select"
                name="gender"
                value={draft.gender || "MALE"}
                onChange={(e) => {
                  console.log("Gender changed to:", e.target.value);
                  setDraft((prev) => ({ ...prev, gender: e.target.value }));
                }}
              >
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
            ) : (
              <div className="value">{user.gender || "-"}</div>
            )}
          </Field>

          <Field label="DOB">
            {isEditing ? (
              <input
                className="input"
                type="date"
                name="dob"
                value={normalizeToISODate(draft.dob)}
                onChange={onChange}
              />
            ) : (
              <div className="value">
                {normalizeToISODate(user.dob) || "-"}
              </div>
            )}
          </Field>
        </div>

        {/* Actions */}
        {isEditing && (
          <div className="actions">
            <button
              className="btn btnPrimary"
              onClick={saveProfile}
              disabled={saving || uploading}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              className="btn btnGhost"
              onClick={cancelEdit}
              disabled={saving || uploading}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
