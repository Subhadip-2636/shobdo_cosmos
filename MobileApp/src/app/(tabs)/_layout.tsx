import {
  Tabs,
} from "expo-router";

import {
  BookOpen,
  Compass,
  Feather,
  Home,
  PenLine,
  UserRound,
} from "lucide-react-native";

import Navbar
  from "../../components/Navbar";

import {
  useLanguage,
} from "../../Language/LanguageContext";


// ==========================================================
// COLORS
// ==========================================================

const COLORS = {

  background:
    "#FBF8F3",

  active:
    "#93661F",

  inactive:
    "#8B8278",

  border:
    "#E7DED2",

  white:
    "#FFFFFF",

};


// ==========================================================
// TAB LAYOUT
// ==========================================================

export default function TabLayout() {

  const {
    t,
  } = useLanguage();


  return (

    <Tabs

      screenOptions={{

        // ==================================================
        // SHARED NAVBAR
        // ==================================================

        header: () => (
          <Navbar />
        ),


        // ==================================================
        // TAB BAR COLORS
        // ==================================================

        tabBarActiveTintColor:
          COLORS.active,

        tabBarInactiveTintColor:
          COLORS.inactive,


        // ==================================================
        // TAB BAR BEHAVIOUR
        // ==================================================

        tabBarHideOnKeyboard:
          true,

        tabBarShowLabel:
          true,


        // ==================================================
        // TAB BAR STYLE
        // ==================================================

        tabBarStyle: {

          height:
            68,

          paddingTop:
            7,

          paddingBottom:
            7,

          backgroundColor:
            COLORS.background,

          borderTopWidth:
            1,

          borderTopColor:
            COLORS.border,

          elevation:
            10,

          shadowColor:
            "#000000",

          shadowOffset: {
            width: 0,
            height: -2,
          },

          shadowOpacity:
            0.05,

          shadowRadius:
            8,

        },


        // ==================================================
        // TAB ITEM
        // ==================================================

        tabBarItemStyle: {

          paddingVertical:
            2,

        },


        // ==================================================
        // TAB LABEL
        // ==================================================

        tabBarLabelStyle: {

          fontSize:
            10,

          fontWeight:
            "700",

          marginTop:
            1,

        },


        // ==================================================
        // HEADER
        // ==================================================

        headerShadowVisible:
          false,

      }}

    >


      {/* ==================================================
          HOME
      ================================================== */}

      <Tabs.Screen

        name="index"

        options={{

          title:
            t("nav.home"),

          tabBarAccessibilityLabel:
            t("nav.home"),

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <Home

              size={
                focused
                  ? 22
                  : 20
              }

              strokeWidth={
                focused
                  ? 2.4
                  : 1.9
              }

              color={color}

            />

          ),

        }}

      />


      {/* ==================================================
          EXPLORE
      ================================================== */}

      <Tabs.Screen

        name="explore"

        options={{

          title:
            t("nav.explore"),

          tabBarAccessibilityLabel:
            t("nav.explore"),

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <Compass

              size={
                focused
                  ? 22
                  : 20
              }

              strokeWidth={
                focused
                  ? 2.4
                  : 1.9
              }

              color={color}

            />

          ),

        }}

      />


      {/* ==================================================
          WRITE
      ================================================== */}

      <Tabs.Screen

        name="write"

        options={{

          title:
            t("nav.write"),

          tabBarAccessibilityLabel:
            t("nav.write"),

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <PenLine

              size={
                focused
                  ? 23
                  : 21
              }

              strokeWidth={
                focused
                  ? 2.5
                  : 2
              }

              color={color}

            />

          ),

        }}

      />


      {/* ==================================================
          MY WRITINGS
      ================================================== */}

      <Tabs.Screen

        name="my-writings"

        options={{

          title:
            t(
              "nav.myWritings"
            ),

          tabBarAccessibilityLabel:
            t(
              "nav.myWritings"
            ),

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <Feather

              size={
                focused
                  ? 22
                  : 20
              }

              strokeWidth={
                focused
                  ? 2.4
                  : 1.9
              }

              color={color}

            />

          ),

        }}

      />


      {/* ==================================================
          ACCOUNT
      ================================================== */}

      <Tabs.Screen

        name="account"

        options={{

          title:
            t("nav.account"),

          tabBarAccessibilityLabel:
            t("nav.account"),

          tabBarIcon: ({
            color,
            focused,
          }) => (

            <UserRound

              size={
                focused
                  ? 22
                  : 20
              }

              strokeWidth={
                focused
                  ? 2.4
                  : 1.9
              }

              color={color}

            />

          ),

        }}

      />


      {/* ==================================================
          ABOUT

          This route remains accessible through Navbar
          navigation, but does not appear in the bottom
          tab bar.
      ================================================== */}

      <Tabs.Screen

        name="about"

        options={{

          href:
            null,

          title:
            "About",

        }}

      />


    </Tabs>

  );

}