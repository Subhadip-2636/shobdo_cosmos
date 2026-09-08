import {
  type ReactNode,
} from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BookOpen,
  Feather,
  Heart,
  Home,
  Info,
  MapPin,
  PenLine,
  Search,
  User,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useLanguage,
} from "../Language/LanguageContext";


// ==========================================================
// FOOTER
// Laptop-inspired dark SHOBDO footer, adapted for mobile.
// ==========================================================

export default function Footer() {

  const {
    language,
    t,
  } = useLanguage();


  const copy =
    language === "bn"
      ? {
          tagline:
            "তোমার শব্দ, তোমার গল্প।",
          description:
            "নিজের ভাষায় গল্প, কবিতা, অনুভূতি এবং ভাবনা প্রকাশের একটি স্থান।",
          navigation:
            "নেভিগেশন",
          support:
            "সহায়তা",
          contact:
            "যোগাযোগ",
          about:
            "আমাদের সম্পর্কে",
          privacy:
            "গোপনীয়তা",
          terms:
            "শর্তাবলি",
          rules:
            "নির্দেশনা",
          locationLabel:
            "অবস্থান",
          locationValue:
            "West Bengal, India",
          creatorLabel:
            "নির্মাতা",
          creatorValue:
            "Subhadip Patra",
          copyright:
            "© 2026 SHOBDO. সর্বস্বত্ব সংরক্ষিত।",
          madeWith:
            "ভালোবাসা দিয়ে তৈরি",
          forWriters:
            "লেখক ও পাঠকদের জন্য",
        }
      : language === "hi"
      ? {
          tagline:
            "आपके शब्द, आपकी कहानी।",
          description:
            "अपनी भाषा में कहानी, कविता, भावनाएँ और विचार साझा करने की एक जगह।",
          navigation:
            "नेविगेशन",
          support:
            "सहायता",
          contact:
            "संपर्क",
          about:
            "हमारे बारे में",
          privacy:
            "गोपनीयता",
          terms:
            "शर्तें",
          rules:
            "दिशानिर्देश",
          locationLabel:
            "स्थान",
          locationValue:
            "West Bengal, India",
          creatorLabel:
            "निर्माता",
          creatorValue:
            "Subhadip Patra",
          copyright:
            "© 2026 SHOBDO. सर्वाधिकार सुरक्षित।",
          madeWith:
            "प्यार से बनाया गया",
          forWriters:
            "लेखकों और पाठकों के लिए",
        }
      : {
          tagline:
            "Your words, your story.",
          description:
            "A place to share stories, poetry, feelings and ideas in your own language.",
          navigation:
            "Navigation",
          support:
            "Support",
          contact:
            "Contact",
          about:
            "About us",
          privacy:
            "Privacy",
          terms:
            "Terms",
          rules:
            "Guidelines",
          locationLabel:
            "Location",
          locationValue:
            "West Bengal, India",
          creatorLabel:
            "Creator",
          creatorValue:
            "Subhadip Patra",
          copyright:
            "© 2026 SHOBDO. All rights reserved.",
          madeWith:
            "Made with love",
          forWriters:
            "for writers and readers",
        };


  const goHome =
    () => {
      router.push(
        "/(tabs)"
      );
    };


  const goExplore =
    () => {
      router.push(
        "/(tabs)/explore"
      );
    };


  const goWrite =
    () => {
      router.push(
        "/(tabs)/write"
      );
    };


  const goMyWritings =
    () => {
      router.push(
        "/(tabs)/my-writings"
      );
    };


  const goAbout =
    () => {
      router.push(
        "/(tabs)/about"
      );
    };


  return (

    <View
      style={
        styles.footer
      }
    >

      {/* ==================================================
          BRAND
      ================================================== */}

      <TouchableOpacity
        activeOpacity={0.78}
        style={styles.brand}
        onPress={goHome}
      >

        <View
          style={
            styles.brandIcon
          }
        >
          <Feather
            size={21}
            color="#C9983E"
          />
        </View>

        <View
          style={
            styles.brandCopy
          }
        >

          <Text
            style={
              styles.brandName
            }
          >
            SHOBDO
          </Text>

          <Text
            style={
              styles.brandBengali
            }
          >
            শব্দ
          </Text>

        </View>

      </TouchableOpacity>


      <Text
        style={
          styles.tagline
        }
      >
        {copy.tagline}
      </Text>


      <Text
        style={
          styles.description
        }
      >
        {copy.description}
      </Text>


      {/* ==================================================
          MAIN FOOTER GRID
      ================================================== */}

      <View
        style={
          styles.grid
        }
      >

        {/* NAVIGATION */}

        <View
          style={
            styles.column
          }
        >

          <Text
            style={
              styles.columnTitle
            }
          >
            {copy.navigation}
          </Text>

          <FooterTextLink
            label={t("nav.home")}
            onPress={goHome}
          />

          <FooterTextLink
            label={t("nav.explore")}
            onPress={goExplore}
          />

          <FooterTextLink
            label={t("nav.write")}
            onPress={goWrite}
          />

          <FooterTextLink
            label={t("nav.myWritings")}
            onPress={goMyWritings}
          />

        </View>


        {/* SUPPORT */}

        <View
          style={
            styles.column
          }
        >

          <Text
            style={
              styles.columnTitle
            }
          >
            {copy.support}
          </Text>

          <FooterTextLink
            label={copy.about}
            onPress={goAbout}
          />

          <FooterTextLink
            label={copy.privacy}
          />

          <FooterTextLink
            label={copy.terms}
          />

          <FooterTextLink
            label={copy.rules}
          />

        </View>

      </View>


      {/* ==================================================
          CONTACT
      ================================================== */}

      <View
        style={
          styles.contactSection
        }
      >

        <Text
          style={
            styles.columnTitle
          }
        >
          {copy.contact}
        </Text>


        <ContactRow
          icon={
            <MapPin
              size={16}
              color="#C9983E"
            />
          }
          label={copy.locationLabel}
          value={copy.locationValue}
        />


        <ContactRow
          icon={
            <User
              size={16}
              color="#C9983E"
            />
          }
          label={copy.creatorLabel}
          value={copy.creatorValue}
        />

      </View>


      {/* ==================================================
          BOTTOM ROW
      ================================================== */}

      <View
        style={
          styles.divider
        }
      />


      <Text
        style={
          styles.copyright
        }
      >
        {copy.copyright}
      </Text>


      <View
        style={
          styles.madeWithRow
        }
      >

        <Text
          style={
            styles.madeWithText
          }
        >
          {copy.madeWith}
        </Text>

        <Heart
          size={12}
          color="#C98D78"
          fill="#C98D78"
        />

        <Text
          style={
            styles.madeWithText
          }
        >
          {copy.forWriters}
        </Text>

      </View>

    </View>

  );

}


// ==========================================================
// TEXT LINK
// ==========================================================

function FooterTextLink({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {

  if (
    !onPress
  ) {

    return (
      <Text
        style={
          styles.textLink
        }
      >
        {label}
      </Text>
    );

  }


  return (

    <TouchableOpacity
      activeOpacity={0.66}
      onPress={onPress}
    >
      <Text
        style={
          styles.textLink
        }
      >
        {label}
      </Text>
    </TouchableOpacity>

  );

}


// ==========================================================
// CONTACT ROW
// ==========================================================

function ContactRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {

  return (

    <View
      style={
        styles.contactRow
      }
    >

      <View
        style={
          styles.contactIcon
        }
      >
        {icon}
      </View>


      <View
        style={
          styles.contactCopy
        }
      >

        <Text
          style={
            styles.contactLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.contactValue
          }
        >
          {value}
        </Text>

      </View>

    </View>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    footer: {
      width: "100%",
      alignSelf: "stretch",

      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 24,

      backgroundColor: "#171613",
    },


    // ======================================================
    // BRAND
    // ======================================================

    brand: {
      flexDirection:
        "row",

      alignItems:
        "center",
    },


    brandIcon: {
      width: 48,
      height: 48,

      borderRadius: 24,

      borderWidth: 1,
      borderColor:
        "#8A6429",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    brandCopy: {
      marginLeft: 12,
    },


    brandName: {
      fontSize: 17,

      fontWeight: "900",

      letterSpacing: 2.4,

      color:
        "#FFF8EE",
    },


    brandBengali: {
      marginTop: 2,

      fontSize: 8,

      color:
        "#948779",
    },


    tagline: {
      marginTop: 22,

      fontSize: 16,
      lineHeight: 23,

      fontWeight: "700",

      color:
        "#D6A241",
    },


    description: {
      marginTop: 8,

      maxWidth: 350,

      fontSize: 9,
      lineHeight: 16,

      color:
        "#918478",
    },


    // ======================================================
    // GRID
    // ======================================================

    grid: {
      marginTop: 26,
      flexDirection: "row",
      gap: 24,
    },


    column: {
      flex: 1,
    },


    columnTitle: {
      marginBottom: 14,

      fontSize: 9,

      fontWeight: "900",

      letterSpacing: 0.9,

      color:
        "#F0E7DA",
    },


    textLink: {
      marginBottom: 12,

      fontSize: 9,
      lineHeight: 15,

      color:
        "#938679",
    },


    // ======================================================
    // CONTACT
    // ======================================================

    contactSection: {
      marginTop: 22,
    },


    contactRow: {
      marginBottom: 13,

      flexDirection:
        "row",

      alignItems:
        "center",
    },


    contactIcon: {
      width: 38,
      height: 38,

      borderRadius: 19,

      borderWidth: 1,
      borderColor:
        "#584324",

      alignItems:
        "center",

      justifyContent:
        "center",
    },


    contactCopy: {
      flex: 1,

      marginLeft: 12,
    },


    contactLabel: {
      fontSize: 7,

      color:
        "#796E64",
    },


    contactValue: {
      marginTop: 3,

      fontSize: 9,

      fontWeight: "700",

      color:
        "#E8D5B8",
    },


    // ======================================================
    // BOTTOM
    // ======================================================

    divider: {
      width: "100%",
      height: 1,
      marginTop: 20,
      backgroundColor: "#39342E",
    },


    copyright: {
      marginTop: 16,
      fontSize: 8,
      lineHeight: 14,
      color: "#756B62",
    },


    madeWithRow: {
      marginTop: 11,

      flexDirection:
        "row",

      flexWrap: "wrap",

      alignItems:
        "center",

      gap: 5,
    },


    madeWithText: {
      fontSize: 8,

      color:
        "#756B62",
    },

  });
