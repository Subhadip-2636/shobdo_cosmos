import {
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  Eye,
  EyeOff,
  Feather,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  PenLine,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react-native";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer
  from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type Mode =
  | "login"
  | "register";

type Copy = {
  eyebrow: string;
  loginTitle: string;
  registerTitle: string;
  loginDescription: string;
  registerDescription: string;
  quote: string;

  accountLabel: string;
  loginTab: string;
  registerTab: string;

  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;

  forgotPassword: string;

  loginButton: string;
  registerButton: string;
  signingIn: string;
  creatingAccount: string;

  switchToRegister: string;
  switchToLogin: string;
  createAccountLink: string;
  loginLink: string;

  checking: string;

  emailRequired: string;
  emailRequiredDescription: string;
  passwordRequired: string;
  passwordRequiredDescription: string;
  nameRequired: string;
  nameRequiredDescription: string;

  loginFailed: string;
  registrationFailed: string;
  genericError: string;

  profileEyebrow: string;
  profileTitle: string;
  sharedAccount: string;
  sharedDescription: string;
  logout: string;
  logoutFailed: string;
  logoutFailedDescription: string;

  securityTitle: string;
  securityDescription: string;
};


// ==========================================================
// SCREEN
// ==========================================================

export default function AccountScreen() {

  const {
    user,
    loading,
    login,
    register,
    logout,
  } = useAuth();


  const {
    language,
  } = useLanguage();


  const copy =
    useMemo<Copy>(
      () => {

        if (
          language === "bn"
        ) {

          return {
            eyebrow:
              "SHOBDO-তে স্বাগতম",
            loginTitle:
              "আপনার অ্যাকাউন্টে লগইন করুন",
            registerTitle:
              "আপনার SHOBDO অ্যাকাউন্ট তৈরি করুন",
            loginDescription:
              "আপনি যে SHOBDO অ্যাকাউন্টটি ওয়েবসাইটে ব্যবহার করেন, একই অ্যাকাউন্ট দিয়ে এখানে লগইন করুন।",
            registerDescription:
              "একটি নতুন SHOBDO অ্যাকাউন্ট তৈরি করুন এবং নিজের ভাষায় লেখা শুরু করুন।",
            quote:
              "“Your words deserve a place where they can be heard.”",

            accountLabel:
              "SHOBDO",
            loginTab:
              "লগইন",
            registerTab:
              "রেজিস্টার",

            name:
              "নাম",
            namePlaceholder:
              "আপনার নাম",
            email:
              "ইমেইল",
            emailPlaceholder:
              "you@example.com",
            password:
              "পাসওয়ার্ড",
            passwordPlaceholder:
              "আপনার পাসওয়ার্ড",

            forgotPassword:
              "পাসওয়ার্ড ভুলে গেছেন?",

            loginButton:
              "লগইন",
            registerButton:
              "অ্যাকাউন্ট তৈরি করুন",
            signingIn:
              "লগইন হচ্ছে...",
            creatingAccount:
              "অ্যাকাউন্ট তৈরি হচ্ছে...",

            switchToRegister:
              "অ্যাকাউন্ট নেই?",
            switchToLogin:
              "ইতিমধ্যে অ্যাকাউন্ট আছে?",
            createAccountLink:
              "রেজিস্টার করুন",
            loginLink:
              "লগইন করুন",

            checking:
              "আপনার অ্যাকাউন্ট যাচাই করা হচ্ছে...",

            emailRequired:
              "ইমেইল প্রয়োজন",
            emailRequiredDescription:
              "আপনার ইমেইল ঠিকানা লিখুন।",
            passwordRequired:
              "পাসওয়ার্ড প্রয়োজন",
            passwordRequiredDescription:
              "আপনার পাসওয়ার্ড লিখুন।",
            nameRequired:
              "নাম প্রয়োজন",
            nameRequiredDescription:
              "আপনার নাম লিখুন।",

            loginFailed:
              "লগইন ব্যর্থ হয়েছে",
            registrationFailed:
              "রেজিস্ট্রেশন ব্যর্থ হয়েছে",
            genericError:
              "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",

            profileEyebrow:
              "আপনার প্রোফাইল",
            profileTitle:
              "অ্যাকাউন্ট",
            sharedAccount:
              "SHOBDO অ্যাকাউন্ট",
            sharedDescription:
              "এই একই অ্যাকাউন্ট SHOBDO ওয়েবসাইট এবং মোবাইল অ্যাপে ব্যবহার করা হয়।",
            logout:
              "লগ আউট",
            logoutFailed:
              "লগ আউট ব্যর্থ হয়েছে",
            logoutFailedDescription:
              "লগ আউট করা যায়নি। আবার চেষ্টা করুন।",

            securityTitle:
              "নিরাপদ সেশন",
            securityDescription:
              "আপনার লগইন সেশন মোবাইলে নিরাপদভাবে সংরক্ষিত থাকে।",
          };

        }


        if (
          language === "hi"
        ) {

          return {
            eyebrow:
              "SHOBDO में आपका स्वागत है",
            loginTitle:
              "अपने अकाउंट में लॉगिन करें",
            registerTitle:
              "अपना SHOBDO अकाउंट बनाएँ",
            loginDescription:
              "वेबसाइट पर उपयोग किए जाने वाले उसी SHOBDO अकाउंट से यहाँ लॉगिन करें।",
            registerDescription:
              "नया SHOBDO अकाउंट बनाएँ और अपनी भाषा में लिखना शुरू करें।",
            quote:
              "“Your words deserve a place where they can be heard.”",

            accountLabel:
              "SHOBDO",
            loginTab:
              "लॉगिन",
            registerTab:
              "रजिस्टर",

            name:
              "नाम",
            namePlaceholder:
              "आपका नाम",
            email:
              "ईमेल",
            emailPlaceholder:
              "you@example.com",
            password:
              "पासवर्ड",
            passwordPlaceholder:
              "आपका पासवर्ड",

            forgotPassword:
              "पासवर्ड भूल गए?",

            loginButton:
              "लॉगिन",
            registerButton:
              "अकाउंट बनाएँ",
            signingIn:
              "लॉगिन हो रहा है...",
            creatingAccount:
              "अकाउंट बन रहा है...",

            switchToRegister:
              "अकाउंट नहीं है?",
            switchToLogin:
              "पहले से अकाउंट है?",
            createAccountLink:
              "रजिस्टर करें",
            loginLink:
              "लॉगिन करें",

            checking:
              "आपका अकाउंट जाँचा जा रहा है...",

            emailRequired:
              "ईमेल आवश्यक है",
            emailRequiredDescription:
              "अपना ईमेल पता दर्ज करें।",
            passwordRequired:
              "पासवर्ड आवश्यक है",
            passwordRequiredDescription:
              "अपना पासवर्ड दर्ज करें।",
            nameRequired:
              "नाम आवश्यक है",
            nameRequiredDescription:
              "अपना नाम दर्ज करें।",

            loginFailed:
              "लॉगिन विफल",
            registrationFailed:
              "रजिस्ट्रेशन विफल",
            genericError:
              "कुछ गलत हुआ। फिर कोशिश करें।",

            profileEyebrow:
              "आपकी प्रोफ़ाइल",
            profileTitle:
              "अकाउंट",
            sharedAccount:
              "SHOBDO अकाउंट",
            sharedDescription:
              "यही अकाउंट SHOBDO वेबसाइट और मोबाइल ऐप दोनों में उपयोग होता है।",
            logout:
              "लॉग आउट",
            logoutFailed:
              "लॉग आउट विफल",
            logoutFailedDescription:
              "लॉग आउट नहीं हो सका। फिर कोशिश करें।",

            securityTitle:
              "सुरक्षित सत्र",
            securityDescription:
              "आपका लॉगिन सत्र मोबाइल पर सुरक्षित रूप से सहेजा जाता है।",
          };

        }


        return {
          eyebrow:
            "WELCOME TO SHOBDO",
          loginTitle:
            "Log in to your account",
          registerTitle:
            "Create your SHOBDO account",
          loginDescription:
            "Sign in with the same SHOBDO account you use on the website.",
          registerDescription:
            "Create a new SHOBDO account and start writing in your own language.",
          quote:
            "“Your words deserve a place where they can be heard.”",

          accountLabel:
            "SHOBDO",
          loginTab:
            "Login",
          registerTab:
            "Register",

          name:
            "Name",
          namePlaceholder:
            "Your name",
          email:
            "Email",
          emailPlaceholder:
            "you@example.com",
          password:
            "Password",
          passwordPlaceholder:
            "Your password",

          forgotPassword:
            "Forgot password?",

          loginButton:
            "Log In",
          registerButton:
            "Create Account",
          signingIn:
            "Signing in...",
          creatingAccount:
            "Creating account...",

          switchToRegister:
            "Don't have an account?",
          switchToLogin:
            "Already have an account?",
          createAccountLink:
            "Create one",
          loginLink:
            "Log in",

          checking:
            "Checking your account...",

          emailRequired:
            "Email required",
          emailRequiredDescription:
            "Please enter your email address.",
          passwordRequired:
            "Password required",
          passwordRequiredDescription:
            "Please enter your password.",
          nameRequired:
            "Name required",
          nameRequiredDescription:
            "Please enter your name.",

          loginFailed:
            "Login failed",
          registrationFailed:
            "Registration failed",
          genericError:
            "Something went wrong. Please try again.",

          profileEyebrow:
            "YOUR PROFILE",
          profileTitle:
            "Account",
          sharedAccount:
            "SHOBDO ACCOUNT",
          sharedDescription:
            "This account is shared between the SHOBDO website and mobile app.",
          logout:
            "Log Out",
          logoutFailed:
            "Logout failed",
          logoutFailedDescription:
            "Unable to log out. Please try again.",

          securityTitle:
            "Secure session",
          securityDescription:
            "Your login session is stored securely on your mobile device.",
        };

      },
      [
        language,
      ]
    );


  // ========================================================
  // STATE
  // ========================================================

  const [
    mode,
    setMode,
  ] =
    useState<Mode>(
      "login"
    );


  const [
    name,
    setName,
  ] =
    useState("");


  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    passwordVisible,
    setPasswordVisible,
  ] =
    useState(false);


  // ========================================================
  // SUBMIT
  // ========================================================

  const handleSubmit =
    async () => {

      if (
        !email.trim()
      ) {

        Alert.alert(
          copy.emailRequired,
          copy.emailRequiredDescription
        );

        return;

      }


      if (
        !password.trim()
      ) {

        Alert.alert(
          copy.passwordRequired,
          copy.passwordRequiredDescription
        );

        return;

      }


      if (
        mode === "register" &&
        !name.trim()
      ) {

        Alert.alert(
          copy.nameRequired,
          copy.nameRequiredDescription
        );

        return;

      }


      try {

        setSubmitting(
          true
        );


        if (
          mode === "login"
        ) {

          await login(
            email.trim(),
            password
          );

        } else {

          await register(
            name.trim(),
            email.trim(),
            password
          );

        }


        setPassword("");

      } catch (
        error: any
      ) {

        Alert.alert(
          mode === "login"
            ? copy.loginFailed
            : copy.registrationFailed,

          error?.message ||
          copy.genericError
        );

      } finally {

        setSubmitting(
          false
        );

      }

    };


  // ========================================================
  // LOGOUT
  // ========================================================

  const handleLogout =
    async () => {

      try {

        await logout();

        setPassword("");

      } catch (
        error: any
      ) {

        Alert.alert(
          copy.logoutFailed,

          error?.message ||
          copy.logoutFailedDescription
        );

      }

    };


  // ========================================================
  // LOADING
  // ========================================================

  if (
    loading
  ) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "left",
          "right",
        ]}
      >

        <View
          style={
            styles.loadingWrap
          }
        >

          <View
            style={
              styles.loadingCard
            }
          >

            <ActivityIndicator
              size="large"
              color="#9A6C20"
            />

            <Text
              style={
                styles.loadingText
              }
            >
              {copy.checking}
            </Text>

          </View>

        </View>

      </SafeAreaView>

    );

  }


  // ========================================================
  // LOGGED-IN PROFILE
  // ========================================================

  if (
    user
  ) {

    return (

      <SafeAreaView
        style={
          styles.safeArea
        }
        edges={[
          "left",
          "right",
        ]}
      >

        <ScrollView

          style={
            styles.scroll
          }

          contentContainerStyle={
            styles.profileContent
          }

          showsVerticalScrollIndicator={
            false
          }

        >

          <View
            style={
              styles.profileHero
            }
          >

            <View
              style={
                styles.eyebrowRow
              }
            >
              <Sparkles
                size={13}
                color="#9A6C20"
              />

              <Text
                style={
                  styles.eyebrow
                }
              >
                {copy.profileEyebrow}
              </Text>
            </View>


            <Text
              style={
                styles.profilePageTitle
              }
            >
              {copy.profileTitle}
            </Text>

          </View>


          <View
            style={
              styles.profileCard
            }
          >

            <View
              style={
                styles.profileAvatar
              }
            >
              <User
                size={34}
                color="#FFFFFF"
              />
            </View>


            <Text
              style={
                styles.profileName
              }
            >
              {user.name}
            </Text>


            <Text
              style={
                styles.profileEmail
              }
            >
              {user.email}
            </Text>


            <View
              style={
                styles.profileDivider
              }
            />


            <View
              style={
                styles.profileInfoRow
              }
            >

              <ShieldCheck
                size={18}
                color="#916723"
              />

              <View
                style={
                  styles.profileInfoCopy
                }
              >

                <Text
                  style={
                    styles.profileInfoTitle
                  }
                >
                  {copy.sharedAccount}
                </Text>

                <Text
                  style={
                    styles.profileInfoDescription
                  }
                >
                  {copy.sharedDescription}
                </Text>

              </View>

            </View>

          </View>


          <View
            style={
              styles.securityCard
            }
          >

            <LockKeyhole
              size={18}
              color="#856024"
            />

            <View
              style={
                styles.securityCopy
              }
            >

              <Text
                style={
                  styles.securityTitle
                }
              >
                {copy.securityTitle}
              </Text>

              <Text
                style={
                  styles.securityDescription
                }
              >
                {copy.securityDescription}
              </Text>

            </View>

          </View>


          <TouchableOpacity

            activeOpacity={0.84}

            style={
              styles.logoutButton
            }

            onPress={
              handleLogout
            }

          >

            <LogOut
              size={18}
              color="#8D342D"
            />

            <Text
              style={
                styles.logoutText
              }
            >
              {copy.logout}
            </Text>

          </TouchableOpacity>


          <Footer />

        </ScrollView>

      </SafeAreaView>

    );

  }


  // ========================================================
  // LOGIN / REGISTER
  //
  // Shared Navbar is rendered by (tabs)/_layout.tsx.
  // Footer is included at the bottom of this page.
  // ========================================================

  return (

    <SafeAreaView
      style={
        styles.safeArea
      }
      edges={[
        "left",
        "right",
      ]}
    >

      <ScrollView

        style={
          styles.scroll
        }

        contentContainerStyle={
          styles.authContent
        }

        keyboardShouldPersistTaps="handled"

        showsVerticalScrollIndicator={
          false
        }

      >

        {/* ==================================================
            LAPTOP-STYLE INTRO
        ================================================== */}

        <View
          style={
            styles.authIntro
          }
        >

          <View
            style={
              styles.eyebrowRow
            }
          >

            <Sparkles
              size={13}
              color="#9A6C20"
            />

            <Text
              style={
                styles.eyebrow
              }
            >
              {copy.eyebrow}
            </Text>

          </View>


          <Text
            style={
              styles.authTitle
            }
          >
            {
              mode ===
                "login"
                ? copy.loginTitle
                : copy.registerTitle
            }
          </Text>


          <Text
            style={
              styles.authDescription
            }
          >
            {
              mode ===
                "login"
                ? copy.loginDescription
                : copy.registerDescription
            }
          </Text>


          <View
            style={
              styles.quoteCard
            }
          >

            <View
              style={
                styles.quoteLine
              }
            />

            <Text
              style={
                styles.quoteText
              }
            >
              {copy.quote}
            </Text>

          </View>

        </View>


        {/* ==================================================
            AUTH CARD
        ================================================== */}

        <View
          style={
            styles.formCard
          }
        >

          <View
            style={
              styles.formBrand
            }
          >

            <View
              style={
                styles.brandIcon
              }
            >

              <Feather
                size={17}
                color="#9A6C20"
              />

            </View>


            <Text
              style={
                styles.formBrandText
              }
            >
              {copy.accountLabel}
            </Text>

          </View>


          <View
            style={
              styles.switchRow
            }
          >

            <TouchableOpacity

              activeOpacity={0.78}

              style={[
                styles.switchButton,

                mode ===
                  "login" &&
                  styles.switchButtonActive,
              ]}

              onPress={() =>
                setMode(
                  "login"
                )
              }

            >

              <Text
                style={[
                  styles.switchText,

                  mode ===
                    "login" &&
                    styles.switchTextActive,
                ]}
              >
                {copy.loginTab}
              </Text>

            </TouchableOpacity>


            <TouchableOpacity

              activeOpacity={0.78}

              style={[
                styles.switchButton,

                mode ===
                  "register" &&
                  styles.switchButtonActive,
              ]}

              onPress={() =>
                setMode(
                  "register"
                )
              }

            >

              <Text
                style={[
                  styles.switchText,

                  mode ===
                    "register" &&
                    styles.switchTextActive,
                ]}
              >
                {copy.registerTab}
              </Text>

            </TouchableOpacity>

          </View>


          {mode ===
            "register" && (

            <View
              style={
                styles.field
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                {copy.name}
              </Text>


              <View
                style={
                  styles.inputWrap
                }
              >

                <User
                  size={16}
                  color="#897B6E"
                />

                <TextInput

                  value={
                    name
                  }

                  onChangeText={
                    setName
                  }

                  placeholder={
                    copy.namePlaceholder
                  }

                  placeholderTextColor="#A99D91"

                  style={
                    styles.input
                  }

                  autoCapitalize="words"

                />

              </View>

            </View>

          )}


          <View
            style={
              styles.field
            }
          >

            <Text
              style={
                styles.label
              }
            >
              {copy.email}
            </Text>


            <View
              style={
                styles.inputWrap
              }
            >

              <Mail
                size={16}
                color="#897B6E"
              />

              <TextInput

                value={
                  email
                }

                onChangeText={
                  setEmail
                }

                placeholder={
                  copy.emailPlaceholder
                }

                placeholderTextColor="#A99D91"

                style={
                  styles.input
                }

                keyboardType="email-address"

                autoCapitalize="none"

                autoCorrect={false}

              />

            </View>

          </View>


          <View
            style={
              styles.field
            }
          >

            <View
              style={
                styles.passwordLabelRow
              }
            >

              <Text
                style={
                  styles.label
                }
              >
                {copy.password}
              </Text>


              {mode ===
                "login" && (

                <Text
                  style={
                    styles.forgotText
                  }
                >
                  {copy.forgotPassword}
                </Text>

              )}

            </View>


            <View
              style={
                styles.inputWrap
              }
            >

              <LockKeyhole
                size={16}
                color="#897B6E"
              />

              <TextInput

                value={
                  password
                }

                onChangeText={
                  setPassword
                }

                placeholder={
                  copy.passwordPlaceholder
                }

                placeholderTextColor="#A99D91"

                style={
                  styles.input
                }

                secureTextEntry={
                  !passwordVisible
                }

                autoCapitalize="none"

              />


              <TouchableOpacity

                activeOpacity={0.68}

                onPress={() =>
                  setPasswordVisible(
                    (
                      current
                    ) =>
                      !current
                  )
                }

              >

                {
                  passwordVisible
                    ? (
                      <EyeOff
                        size={17}
                        color="#85776A"
                      />
                    )
                    : (
                      <Eye
                        size={17}
                        color="#85776A"
                      />
                    )
                }

              </TouchableOpacity>

            </View>

          </View>


          <TouchableOpacity

            activeOpacity={0.84}

            disabled={
              submitting
            }

            style={[
              styles.submitButton,

              submitting &&
                styles.submitButtonDisabled,
            ]}

            onPress={
              handleSubmit
            }

          >

            {submitting ? (

              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

            ) : mode ===
              "login" ? (

              <LogIn
                size={17}
                color="#FFFFFF"
              />

            ) : (

              <UserPlus
                size={17}
                color="#FFFFFF"
              />

            )}


            <Text
              style={
                styles.submitText
              }
            >
              {
                submitting
                  ? (
                      mode ===
                        "login"
                        ? copy.signingIn
                        : copy.creatingAccount
                    )
                  : (
                      mode ===
                        "login"
                        ? copy.loginButton
                        : copy.registerButton
                    )
              }
            </Text>

          </TouchableOpacity>


          <View
            style={
              styles.switchHint
            }
          >

            <Text
              style={
                styles.switchHintText
              }
            >
              {
                mode ===
                  "login"
                  ? copy.switchToRegister
                  : copy.switchToLogin
              }
            </Text>


            <TouchableOpacity

              activeOpacity={0.72}

              onPress={() =>
                setMode(
                  mode ===
                    "login"
                    ? "register"
                    : "login"
                )
              }

            >

              <Text
                style={
                  styles.switchHintLink
                }
              >
                {
                  mode ===
                    "login"
                    ? copy.createAccountLink
                    : copy.loginLink
                }
              </Text>

            </TouchableOpacity>

          </View>

        </View>


        <View
          style={
            styles.authSecurity
          }
        >

          <ShieldCheck
            size={17}
            color="#8B6526"
          />

          <Text
            style={
              styles.authSecurityText
            }
          >
            {
              copy.securityDescription
            }
          </Text>

        </View>


        <Footer />

      </ScrollView>

    </SafeAreaView>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor:
        "#F8F5EF",
    },


    scroll: {
      flex: 1,
    },


    // ======================================================
    // LOADING
    // ======================================================

    loadingWrap: {
      flex: 1,

      padding: 18,

      justifyContent:
        "center",
    },


    loadingCard: {
      minHeight: 200,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#DDD2C5",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFDF9",
    },


    loadingText: {
      marginTop: 12,

      fontSize: 11,

      fontWeight: "700",

      color: "#7C7064",
    },


    // ======================================================
    // AUTH LAYOUT
    // ======================================================

    authContent: {
      paddingTop: 0,
      paddingBottom: 0,

      backgroundColor:
        "#F8F5EF",
    },


    authIntro: {
      paddingHorizontal: 22,
      paddingTop: 34,
      paddingBottom: 28,

      backgroundColor:
        "#F3ECE2",
    },


    eyebrowRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 6,
    },


    eyebrow: {
      fontSize: 8,

      fontWeight: "900",

      letterSpacing: 1.5,

      color: "#9A6C20",
    },


    authTitle: {
      marginTop: 14,

      maxWidth: 350,

      fontSize: 32,
      lineHeight: 40,

      fontWeight: "900",

      letterSpacing: -0.5,

      color: "#29231F",
    },


    authDescription: {
      marginTop: 11,

      maxWidth: 345,

      fontSize: 11,
      lineHeight: 20,

      color: "#796D61",
    },


    quoteCard: {
      marginTop: 23,

      minHeight: 75,

      paddingHorizontal: 15,
      paddingVertical: 14,

      borderRadius: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#F8F3EB",
    },


    quoteLine: {
      width: 2,
      height: 43,

      marginRight: 12,

      backgroundColor:
        "#B88A42",
    },


    quoteText: {
      flex: 1,

      fontSize: 10,
      lineHeight: 17,

      fontStyle: "italic",

      color: "#786B5E",
    },


    // ======================================================
    // FORM CARD
    // ======================================================

    formCard: {
      marginHorizontal: 18,
      marginTop: 18,

      padding: 18,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#DDD3C7",

      backgroundColor:
        "#FFFDF9",

      shadowColor:
        "#000000",

      shadowOpacity: 0.05,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },


    formBrand: {
      flexDirection:
        "row",

      alignItems:
        "center",

      marginBottom: 14,
    },


    brandIcon: {
      width: 34,
      height: 34,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        "#D4B982",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F7EEDC",
    },


    formBrandText: {
      marginLeft: 9,

      fontSize: 10,

      fontWeight: "900",

      letterSpacing: 2,

      color: "#4C3162",
    },


    switchRow: {
      padding: 4,

      marginBottom: 17,

      borderRadius: 12,

      flexDirection:
        "row",

      backgroundColor:
        "#EEE7DE",
    },


    switchButton: {
      flex: 1,

      minHeight: 39,

      borderRadius: 9,

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    switchButtonActive: {
      backgroundColor:
        "#FFFFFF",
    },


    switchText: {
      fontSize: 10,

      fontWeight: "700",

      color: "#8C8074",
    },


    switchTextActive: {
      fontWeight: "900",

      color: "#3A3129",
    },


    field: {
      marginBottom: 15,
    },


    passwordLabelRow: {
      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      marginBottom: 7,
    },


    label: {
      marginBottom: 7,

      fontSize: 9,

      fontWeight: "800",

      color: "#574B40",
    },


    forgotText: {
      marginBottom: 7,

      fontSize: 8,

      fontWeight: "700",

      color: "#9A6C20",
    },


    inputWrap: {
      minHeight: 50,

      paddingHorizontal: 13,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        "#DCD3C8",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#FFFFFF",
    },


    input: {
      flex: 1,

      paddingVertical: 0,

      fontSize: 11,

      color: "#302A24",
    },


    submitButton: {
      minHeight: 50,

      marginTop: 2,

      borderRadius: 11,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 8,

      backgroundColor:
        "#2D2823",
    },


    submitButtonDisabled: {
      opacity: 0.62,
    },


    submitText: {
      fontSize: 10,

      fontWeight: "900",

      color: "#FFFFFF",
    },


    switchHint: {
      marginTop: 15,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 5,
    },


    switchHintText: {
      fontSize: 8,

      color: "#908376",
    },


    switchHintLink: {
      fontSize: 8,

      fontWeight: "900",

      color: "#8D611D",
    },


    authSecurity: {
      marginHorizontal: 18,
      marginTop: 12,
      marginBottom: 22,

      padding: 13,

      borderRadius: 12,

      borderWidth: 1,

      borderColor:
        "#DECDB6",

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 8,

      backgroundColor:
        "#F2E5D2",
    },


    authSecurityText: {
      flex: 1,

      fontSize: 8,
      lineHeight: 14,

      color: "#806A4C",
    },


    // ======================================================
    // PROFILE
    // ======================================================

    profileContent: {
      paddingBottom: 0,
    },


    profileHero: {
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 24,

      backgroundColor:
        "#F2ECE3",
    },


    profilePageTitle: {
      marginTop: 9,

      fontSize: 31,

      fontWeight: "900",

      color: "#2E2924",
    },


    profileCard: {
      marginHorizontal: 18,
      marginTop: 18,

      padding: 22,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        "#DDD2C5",

      alignItems:
        "center",

      backgroundColor:
        "#FFFDF9",
    },


    profileAvatar: {
      width: 66,
      height: 66,

      borderRadius: 33,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#A57829",
    },


    profileName: {
      marginTop: 14,

      fontSize: 20,

      fontWeight: "900",

      color: "#332D28",
    },


    profileEmail: {
      marginTop: 5,

      fontSize: 10,

      color: "#897C70",
    },


    profileDivider: {
      width: "100%",
      height: 1,

      marginVertical: 18,

      backgroundColor:
        "#E8E0D6",
    },


    profileInfoRow: {
      width: "100%",

      flexDirection:
        "row",

      alignItems:
        "flex-start",
    },


    profileInfoCopy: {
      flex: 1,

      marginLeft: 10,
    },


    profileInfoTitle: {
      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 1,

      color: "#72511D",
    },


    profileInfoDescription: {
      marginTop: 4,

      fontSize: 9,
      lineHeight: 15,

      color: "#847667",
    },


    securityCard: {
      marginHorizontal: 18,
      marginTop: 12,

      padding: 14,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        "#DECDB6",

      flexDirection:
        "row",

      backgroundColor:
        "#F1E4D1",
    },


    securityCopy: {
      flex: 1,

      marginLeft: 9,
    },


    securityTitle: {
      fontSize: 9,

      fontWeight: "900",

      color: "#745521",
    },


    securityDescription: {
      marginTop: 4,

      fontSize: 8,
      lineHeight: 14,

      color: "#8C7759",
    },


    logoutButton: {
      marginHorizontal: 18,
      marginTop: 13,
      marginBottom: 22,

      minHeight: 48,

      borderRadius: 11,

      borderWidth: 1,

      borderColor:
        "#E2C6C2",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 7,

      backgroundColor:
        "#FFF8F6",
    },


    logoutText: {
      fontSize: 10,

      fontWeight: "900",

      color: "#8D342D",
    },

  });
