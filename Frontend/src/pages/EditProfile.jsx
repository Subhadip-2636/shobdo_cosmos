import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  AtSign,
  Globe2,
  Image,
  Loader2,
  MapPin,
  Save,
  User,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  updateMyProfile,
} from "../api/api";

import "./EditProfile.css";


// =========================================================
// EDIT PROFILE
// =========================================================

function EditProfile({
  user,
  onProfileUpdated,
}) {

  const navigate =
    useNavigate();


  // =====================================================
  // FORM STATE
  // =====================================================

  const [
    form,
    setForm,
  ] = useState({
    name: "",
    username: "",
    bio: "",
    location: "",
    website: "",
    avatar_url: "",
  });


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  // =====================================================
  // LOAD CURRENT USER INTO FORM
  // =====================================================

  useEffect(() => {

    if (!user) {
      return;
    }


    setForm({
      name:
        user.name || "",

      username:
        user.username || "",

      bio:
        user.bio || "",

      location:
        user.location || "",

      website:
        user.website || "",

      avatar_url:
        user.avatar_url || "",
    });

  }, [user]);


  // =====================================================
  // INITIALS
  // =====================================================

  const initials =
    useMemo(
      () => {

        const name =
          form.name.trim();

        if (!name) {
          return "S";
        }


        return name
          .split(/\s+/)
          .slice(0, 2)
          .map(
            (part) =>
              part.charAt(0)
                .toUpperCase()
          )
          .join("");

      },
      [form.name]
    );


  // =====================================================
  // CHANGE HANDLER
  // =====================================================

  function handleChange(
    event
  ) {

    const {
      name,
      value,
    } = event.target;


    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );


    setError("");
    setSuccess("");

  }


  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    if (
      form.name.trim().length < 2
    ) {

      setError(
        "Name must contain at least 2 characters."
      );

      return;
    }


    setSaving(true);
    setError("");
    setSuccess("");


    try {

      const data =
        await updateMyProfile({
          name:
            form.name.trim(),

          username:
            form.username.trim(),

          bio:
            form.bio.trim(),

          location:
            form.location.trim(),

          website:
            form.website.trim(),

          avatar_url:
            form.avatar_url.trim(),
        });


      setSuccess(
        data?.message ||
        "Profile updated successfully."
      );


      if (
        typeof onProfileUpdated ===
        "function"
      ) {

        await onProfileUpdated();

      }

    } catch (err) {

      console.error(
        "PROFILE UPDATE ERROR:",
        err
      );


      setError(
        err?.message ||
        "Unable to update profile."
      );

    } finally {

      setSaving(false);

    }

  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="edit-profile-page">

      <div className="edit-profile-container">


        <button
          type="button"
          className="edit-profile-back"
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <section className="edit-profile-header">

          <p className="edit-profile-eyebrow">
            YOUR PROFILE
          </p>

          <h1>
            Edit Profile
          </h1>

          <p>
            Personalize how readers see
            you across SHOBDO.
          </p>

        </section>


        <div className="edit-profile-layout">


          {/* ============================================
              PROFILE PREVIEW
          ============================================= */}

          <aside className="edit-profile-preview">

            <div className="profile-avatar-preview">

              {form.avatar_url ? (

                <img
                  src={form.avatar_url}
                  alt={form.name || "Profile"}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />

              ) : (

                <span>
                  {initials}
                </span>

              )}

            </div>


            <h2>
              {form.name ||
                "Your name"}
            </h2>


            {form.username && (

              <p className="profile-preview-username">
                @{form.username
                  .replace(/^@/, "")
                  .toLowerCase()}
              </p>

            )}


            {form.bio ? (

              <p className="profile-preview-bio">
                {form.bio}
              </p>

            ) : (

              <p className="profile-preview-placeholder">
                Your bio will appear here.
              </p>

            )}


            {form.location && (

              <div className="profile-preview-meta">
                <MapPin size={16} />
                <span>
                  {form.location}
                </span>
              </div>

            )}


            {form.website && (

              <div className="profile-preview-meta">
                <Globe2 size={16} />
                <span>
                  {form.website}
                </span>
              </div>

            )}

          </aside>


          {/* ============================================
              FORM
          ============================================= */}

          <form
            className="edit-profile-form"
            onSubmit={handleSubmit}
          >

            <div className="edit-profile-field">

              <label htmlFor="name">
                <User size={17} />
                Display name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                maxLength={120}
                autoComplete="name"
                required
                placeholder="Your name"
              />

            </div>


            <div className="edit-profile-field">

              <label htmlFor="username">
                <AtSign size={17} />
                Username
              </label>

              <div className="username-input-wrapper">

                <span>
                  @
                </span>

                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  maxLength={30}
                  autoComplete="username"
                  placeholder="your.username"
                />

              </div>

              <small>
                3–30 characters. Use letters,
                numbers, dots or underscores.
              </small>

            </div>


            <div className="edit-profile-field">

              <label htmlFor="bio">
                Bio
              </label>

              <textarea
                id="bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                maxLength={500}
                rows={6}
                placeholder="Tell readers a little about yourself..."
              />

              <small className="field-counter">
                {form.bio.length}/500
              </small>

            </div>


            <div className="edit-profile-field">

              <label htmlFor="location">
                <MapPin size={17} />
                Location
              </label>

              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                maxLength={100}
                placeholder="Kolkata, West Bengal"
              />

            </div>


            <div className="edit-profile-field">

              <label htmlFor="website">
                <Globe2 size={17} />
                Website
              </label>

              <input
                id="website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                maxLength={255}
                placeholder="https://example.com"
              />

            </div>


            <div className="edit-profile-field">

              <label htmlFor="avatar_url">
                <Image size={17} />
                Profile picture URL
              </label>

              <input
                id="avatar_url"
                name="avatar_url"
                type="url"
                value={form.avatar_url}
                onChange={handleChange}
                maxLength={500}
                placeholder="https://example.com/photo.jpg"
              />

              <small>
                We will add direct image upload
                later.
              </small>

            </div>


            {error && (

              <div
                className="edit-profile-message error"
                role="alert"
              >
                {error}
              </div>

            )}


            {success && (

              <div
                className="edit-profile-message success"
                role="status"
              >
                {success}
              </div>

            )}


            <div className="edit-profile-actions">

              <button
                type="button"
                className="profile-cancel-button"
                disabled={saving}
                onClick={() =>
                  navigate(-1)
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="profile-save-button"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <Loader2
                      size={18}
                      className="profile-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Profile
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}


export default EditProfile;