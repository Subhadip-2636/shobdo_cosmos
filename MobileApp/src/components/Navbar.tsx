import {
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Check,
  ChevronDown,
  Compass,
  Feather,
  Globe2,
  Home,
  Info,
  Menu,
  PenLine,
  UserRound,
  X,
} from "lucide-react-native";

import {
  router,
  usePathname,
} from "expo-router";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  useLanguage,
  type LanguageCode,
} from "../Language/LanguageContext";


// ==========================================================
// TYPES
// ==========================================================

type NavItem = {
  key: string;
  label: string;
  icon: ReactNode;
  route:
    | "/(tabs)"
    | "/(tabs)/explore"
    | "/(tabs)/write"
    | "/(tabs)/my-writings"
    | "/(tabs)/account"
    | "/(tabs)/about";
};


// ==========================================================
// NAVBAR
// ==========================================================

export default function Navbar() {

  const pathname =
    usePathname();


  const {
    user,
  } = useAuth();


  const {
    language,
    selectedLanguage,
    languages,
    setLanguage,
    t,
  } = useLanguage();


  const [
    languageOpen,
    setLanguageOpen,
  ] =
    useState(false);


  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);


  // ========================================================
  // NAVIGATION
  // ========================================================

  const goHome =
    () => {

      closeMenus();

      router.push(
        "/(tabs)"
      );

    };


  const goTo =
    (
      route:
        NavItem["route"]
    ) => {

      closeMenus();

      router.push(
        route
      );

    };


  const closeMenus =
    () => {

      setLanguageOpen(false);
      setMenuOpen(false);

    };


  // ========================================================
  // LANGUAGE
  // ========================================================

  const handleLanguageChange =
    (
      code:
        LanguageCode
    ) => {

      setLanguage(
        code
      );

      setLanguageOpen(
        false
      );

    };


  // ========================================================
  // USER INITIAL
  // ========================================================

  const userInitial =
    useMemo(
      () => {

        const name =
          user?.name?.trim();

        if (!name) {
          return "S";
        }

        return (
          name
            .charAt(0)
            .toUpperCase()
        );

      },
      [
        user?.name,
      ]
    );


  // ========================================================
  // MENU ITEMS
  // ========================================================

  const aboutLabel =
    t("nav.about");

  const navItems:
    NavItem[] = [

      {
        key: "home",
        label:
          t("nav.home"),
        icon:
          <Home
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)",
      },

      {
        key: "explore",
        label:
          t("nav.explore"),
        icon:
          <Compass
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)/explore",
      },

      {
        key: "write",
        label:
          t("nav.write"),
        icon:
          <PenLine
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)/write",
      },

      {
        key: "my-writings",
        label:
          t("nav.myWritings"),
        icon:
          <Feather
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)/my-writings",
      },

      {
        key: "account",
        label:
          t("nav.account"),
        icon:
          <UserRound
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)/account",
      },

      {
        key: "about",
        label:
          aboutLabel,
        icon:
          <Info
            size={17}
            color="#735621"
          />,
        route:
          "/(tabs)/about",
      },

    ];


  // ========================================================
  // ACTIVE ROUTE
  // ========================================================

  const isActive =
    (
      key: string
    ) => {

      if (
        key === "home"
      ) {

        return (
          pathname === "/" ||
          pathname === "/(tabs)" ||
          pathname === "/index"
        );

      }


      if (
        key === "explore"
      ) {

        return pathname.includes(
          "/explore"
        );

      }


      if (
        key === "write"
      ) {

        return (
          pathname.includes(
            "/write"
          ) &&
          !pathname.includes(
            "/my-writings"
          )
        );

      }


      if (
        key ===
        "my-writings"
      ) {

        return pathname.includes(
          "/my-writings"
        );

      }


      if (
        key === "account"
      ) {

        return pathname.includes(
          "/account"
        );

      }


      if (
        key === "about"
      ) {

        return pathname.includes(
          "/about"
        );

      }


      return false;

    };


  // ========================================================
  // RENDER
  // ========================================================

  return (

    <>

      <View
        style={
          styles.wrapper
        }
      >

        <View
          style={
            styles.navbar
          }
        >

          {/* ==================================================
              BRAND
          ================================================== */}

          <TouchableOpacity

            activeOpacity={0.78}

            style={
              styles.brand
            }

            onPress={
              goHome
            }

          >

            <View
              style={
                styles.brandSymbol
              }
            >

              <Feather
                size={20}
                color="#7D5A1C"
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


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <View
            style={
              styles.actions
            }
          >

            {/* LANGUAGE */}

            <TouchableOpacity

              activeOpacity={0.78}

              style={[
                styles.languageButton,

                languageOpen &&
                  styles.actionButtonActive,
              ]}

              onPress={() => {

                setLanguageOpen(
                  true
                );

                setMenuOpen(
                  false
                );

              }}

            >

              <Globe2
                size={16}
                color="#79561C"
              />

              <Text
                style={
                  styles.languageButtonText
                }
                numberOfLines={1}
              >
                {
                  selectedLanguage
                    .nativeLabel
                }
              </Text>

              <ChevronDown
                size={14}
                color="#8C7658"
              />

            </TouchableOpacity>


            {/* ACCOUNT */}

            <TouchableOpacity

              activeOpacity={0.78}

              style={
                styles.accountButton
              }

              onPress={() =>
                goTo(
                  "/(tabs)/account"
                )
              }

            >

              {user ? (

                <Text
                  style={
                    styles.userInitial
                  }
                >
                  {userInitial}
                </Text>

              ) : (

                <UserRound
                  size={17}
                  color="#74541F"
                />

              )}

            </TouchableOpacity>


            {/* MENU */}

            <TouchableOpacity

              activeOpacity={0.78}

              style={[
                styles.menuButton,

                menuOpen &&
                  styles.actionButtonActive,
              ]}

              onPress={() => {

                setMenuOpen(
                  true
                );

                setLanguageOpen(
                  false
                );

              }}

            >

              <Menu
                size={19}
                color="#574B3F"
              />

            </TouchableOpacity>

          </View>

        </View>


        {/* GOLD ACCENT */}

        <View
          style={
            styles.accentLine
          }
        />

      </View>


      {/* ====================================================
          LANGUAGE MODAL
      ==================================================== */}

      <Modal

        visible={
          languageOpen
        }

        transparent

        animationType="fade"

        statusBarTranslucent

        onRequestClose={() =>
          setLanguageOpen(
            false
          )
        }

      >

        <View
          style={
            styles.modalRoot
          }
        >

          <Pressable

            style={
              styles.modalBackdrop
            }

            onPress={() =>
              setLanguageOpen(
                false
              )
            }

          />


          <View
            style={
              styles.languageSheet
            }
          >

            <View
              style={
                styles.sheetHandle
              }
            />


            <View
              style={
                styles.sheetHeader
              }
            >

              <View
                style={
                  styles.sheetTitleRow
                }
              >

                <View
                  style={
                    styles.sheetIcon
                  }
                >

                  <Globe2
                    size={18}
                    color="#8A611F"
                  />

                </View>


                <View>

                  <Text
                    style={
                      styles.sheetEyebrow
                    }
                  >
                    SHOBDO
                  </Text>

                  <Text
                    style={
                      styles.sheetTitle
                    }
                  >
                    {
                      t(
                        "language.label"
                      )
                    }
                  </Text>

                </View>

              </View>


              <TouchableOpacity

                activeOpacity={0.72}

                style={
                  styles.closeButton
                }

                onPress={() =>
                  setLanguageOpen(
                    false
                  )
                }

              >

                <X
                  size={18}
                  color="#5F544A"
                />

              </TouchableOpacity>

            </View>


            <View
              style={
                styles.languageList
              }
            >

              {languages.map(
                (
                  item
                ) => {

                  const selected =
                    language ===
                    item.code;


                  return (

                    <TouchableOpacity

                      key={
                        item.code
                      }

                      activeOpacity={0.76}

                      style={[
                        styles.languageOption,

                        selected &&
                          styles.languageOptionSelected,
                      ]}

                      onPress={() =>
                        handleLanguageChange(
                          item.code
                        )
                      }

                    >

                      <View
                        style={
                          styles.languageOptionCopy
                        }
                      >

                        <Text
                          style={[
                            styles.languageNative,

                            selected &&
                              styles.languageNativeSelected,
                          ]}
                        >
                          {
                            item.nativeLabel
                          }
                        </Text>

                        <Text
                          style={
                            styles.languageEnglish
                          }
                        >
                          {item.label}
                        </Text>

                      </View>


                      <View
                        style={[
                          styles.checkCircle,

                          selected &&
                            styles.checkCircleSelected,
                        ]}
                      >

                        {selected && (

                          <Check
                            size={14}
                            color="#FFFFFF"
                          />

                        )}

                      </View>

                    </TouchableOpacity>

                  );

                }
              )}

            </View>

          </View>

        </View>

      </Modal>


      {/* ====================================================
          NAVIGATION MENU MODAL
      ==================================================== */}

      <Modal

        visible={
          menuOpen
        }

        transparent

        animationType="fade"

        statusBarTranslucent

        onRequestClose={() =>
          setMenuOpen(
            false
          )
        }

      >

        <View
          style={
            styles.modalRoot
          }
        >

          <Pressable

            style={
              styles.modalBackdrop
            }

            onPress={() =>
              setMenuOpen(
                false
              )
            }

          />


          <View
            style={
              styles.menuSheet
            }
          >

            <View
              style={
                styles.sheetHandle
              }
            />


            <View
              style={
                styles.sheetHeader
              }
            >

              <View
                style={
                  styles.sheetTitleRow
                }
              >

                <View
                  style={
                    styles.sheetIcon
                  }
                >

                  <Feather
                    size={18}
                    color="#8A611F"
                  />

                </View>


                <View>

                  <Text
                    style={
                      styles.sheetEyebrow
                    }
                  >
                    SHOBDO
                  </Text>

                  <Text
                    style={
                      styles.sheetTitle
                    }
                  >
                    {
                      t(
                        "nav.menu"
                      )
                    }
                  </Text>

                </View>

              </View>


              <TouchableOpacity

                activeOpacity={0.72}

                style={
                  styles.closeButton
                }

                onPress={() =>
                  setMenuOpen(
                    false
                  )
                }

              >

                <X
                  size={18}
                  color="#5F544A"
                />

              </TouchableOpacity>

            </View>


            {/* USER SUMMARY */}

            <TouchableOpacity

              activeOpacity={0.76}

              style={
                styles.userCard
              }

              onPress={() =>
                goTo(
                  "/(tabs)/account"
                )
              }

            >

              <View
                style={
                  styles.userAvatar
                }
              >

                {user ? (

                  <Text
                    style={
                      styles.userAvatarText
                    }
                  >
                    {userInitial}
                  </Text>

                ) : (

                  <UserRound
                    size={18}
                    color="#8A611F"
                  />

                )}

              </View>


              <View
                style={
                  styles.userCardCopy
                }
              >

                <Text
                  style={
                    styles.userCardName
                  }
                  numberOfLines={1}
                >
                  {
                    user?.name ||
                    t(
                      "account.signIn"
                    )
                  }
                </Text>

                <Text
                  style={
                    styles.userCardMeta
                  }
                  numberOfLines={1}
                >
                  {
                    user?.email ||
                    t(
                      "account.loginDescription"
                    )
                  }
                </Text>

              </View>


              <ChevronDown
                size={15}
                color="#9A8C7C"
                style={{
                  transform: [
                    {
                      rotate:
                        "-90deg",
                    },
                  ],
                }}
              />

            </TouchableOpacity>


            {/* NAV ITEMS */}

            <View
              style={
                styles.menuList
              }
            >

              {navItems.map(
                (
                  item
                ) => {

                  const active =
                    isActive(
                      item.key
                    );


                  return (

                    <TouchableOpacity

                      key={
                        item.key
                      }

                      activeOpacity={0.74}

                      style={[
                        styles.menuItem,

                        active &&
                          styles.menuItemActive,
                      ]}

                      onPress={() =>
                        goTo(
                          item.route
                        )
                      }

                    >

                      <View
                        style={[
                          styles.menuItemIcon,

                          active &&
                            styles.menuItemIconActive,
                        ]}
                      >
                        {item.icon}
                      </View>


                      <Text
                        style={[
                          styles.menuItemText,

                          active &&
                            styles.menuItemTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>


                      {active && (

                        <View
                          style={
                            styles.activeDot
                          }
                        />

                      )}

                    </TouchableOpacity>

                  );

                }
              )}

            </View>


            {/* LANGUAGE SHORTCUT */}

            <TouchableOpacity

              activeOpacity={0.76}

              style={
                styles.menuLanguageShortcut
              }

              onPress={() => {

                setMenuOpen(
                  false
                );

                setTimeout(
                  () => {
                    setLanguageOpen(
                      true
                    );
                  },
                  180
                );

              }}

            >

              <Globe2
                size={17}
                color="#8A611F"
              />

              <View
                style={
                  styles.menuLanguageCopy
                }
              >

                <Text
                  style={
                    styles.menuLanguageLabel
                  }
                >
                  {
                    t(
                      "language.label"
                    )
                  }
                </Text>

                <Text
                  style={
                    styles.menuLanguageValue
                  }
                >
                  {
                    selectedLanguage
                      .nativeLabel
                  }
                </Text>

              </View>


              <ChevronDown
                size={15}
                color="#897A69"
              />

            </TouchableOpacity>

          </View>

        </View>

      </Modal>

    </>

  );

}


// ==========================================================
// STYLES
// ==========================================================

const styles =
  StyleSheet.create({

    // ======================================================
    // WRAPPER
    // ======================================================

    wrapper: {

      backgroundColor:
        "#F8F5EF",

    },


    navbar: {

      minHeight: 70,

      paddingHorizontal: 16,
      paddingVertical: 10,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      borderBottomWidth: 1,

      borderBottomColor:
        "#E2D9CE",

      backgroundColor:
        "#F8F5EF",

    },


    accentLine: {

      width: 40,
      height: 2,

      marginLeft: 18,

      marginTop: -1,

      borderRadius: 1,

      backgroundColor:
        "#A77A2E",

    },


    // ======================================================
    // BRAND
    // ======================================================

    brand: {

      flexDirection:
        "row",

      alignItems:
        "center",

      flexShrink: 1,

    },


    brandSymbol: {

      width: 40,
      height: 40,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        "#B7914D",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FCF9F3",

    },


    brandCopy: {

      marginLeft: 10,

    },


    brandName: {

      fontSize: 16,

      fontWeight: "900",

      letterSpacing: 2.6,

      color: "#2D2823",

    },


    brandBengali: {

      marginTop: -1,

      fontSize: 9,

      fontWeight: "600",

      color: "#8B8074",

    },


    // ======================================================
    // ACTIONS
    // ======================================================

    actions: {

      flexDirection:
        "row",

      alignItems:
        "center",

      gap: 7,

      marginLeft: 10,

    },


    languageButton: {

      maxWidth: 115,
      minHeight: 38,

      paddingHorizontal: 10,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        "#DDD1C1",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "center",

      gap: 5,

      backgroundColor:
        "#FFFDF9",

    },


    languageButtonText: {

      maxWidth: 65,

      fontSize: 10,

      fontWeight: "800",

      color: "#604C2D",

    },


    accountButton: {

      width: 38,
      height: 38,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        "#DDD1C1",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFDF9",

    },


    userInitial: {

      fontSize: 12,

      fontWeight: "900",

      color: "#754F17",

    },


    menuButton: {

      width: 38,
      height: 38,

      borderRadius: 19,

      borderWidth: 1,

      borderColor:
        "#DDD1C1",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#FFFDF9",

    },


    actionButtonActive: {

      borderColor:
        "#B7924D",

      backgroundColor:
        "#F3E7D3",

    },


    // ======================================================
    // MODAL
    // ======================================================

    modalRoot: {

      flex: 1,

      justifyContent:
        "flex-end",

    },


    modalBackdrop: {

      ...StyleSheet.absoluteFill,

      backgroundColor:
        "rgba(28, 23, 19, 0.34)",

    },


    languageSheet: {

      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 30,

      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,

      borderWidth: 1,

      borderColor:
        "#E2D6C7",

      backgroundColor:
        "#FBF8F2",

    },


    menuSheet: {

      maxHeight: "88%",

      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: 28,

      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,

      borderWidth: 1,

      borderColor:
        "#E2D6C7",

      backgroundColor:
        "#FBF8F2",

    },


    sheetHandle: {

      alignSelf:
        "center",

      width: 40,
      height: 4,

      borderRadius: 2,

      backgroundColor:
        "#D2C4B4",

    },


    sheetHeader: {

      marginTop: 15,
      marginBottom: 17,

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

    },


    sheetTitleRow: {

      flexDirection:
        "row",

      alignItems:
        "center",

    },


    sheetIcon: {

      width: 38,
      height: 38,

      marginRight: 10,

      borderRadius: 12,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F1E4D0",

    },


    sheetEyebrow: {

      fontSize: 7,

      fontWeight: "900",

      letterSpacing: 1.5,

      color: "#A0783D",

    },


    sheetTitle: {

      marginTop: 2,

      fontSize: 18,

      fontWeight: "900",

      color: "#342D26",

    },


    closeButton: {

      width: 36,
      height: 36,

      borderRadius: 18,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#EEE7DF",

    },


    // ======================================================
    // LANGUAGE
    // ======================================================

    languageList: {

      gap: 9,

    },


    languageOption: {

      minHeight: 62,

      paddingHorizontal: 14,
      paddingVertical: 10,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#E2D8CD",

      flexDirection:
        "row",

      alignItems:
        "center",

      justifyContent:
        "space-between",

      backgroundColor:
        "#FFFFFF",

    },


    languageOptionSelected: {

      borderColor:
        "#B88A3E",

      backgroundColor:
        "#F4E8D4",

    },


    languageOptionCopy: {

      flex: 1,

    },


    languageNative: {

      fontSize: 14,

      fontWeight: "800",

      color: "#4E443A",

    },


    languageNativeSelected: {

      color: "#775319",

    },


    languageEnglish: {

      marginTop: 3,

      fontSize: 9,

      fontWeight: "600",

      color: "#9B8D7D",

    },


    checkCircle: {

      width: 26,
      height: 26,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        "#D8CCBE",

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F8F4EE",

    },


    checkCircleSelected: {

      borderColor:
        "#9A6C20",

      backgroundColor:
        "#9A6C20",

    },


    // ======================================================
    // USER CARD
    // ======================================================

    userCard: {

      minHeight: 66,

      padding: 12,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        "#E1D5C7",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#F4EBDD",

    },


    userAvatar: {

      width: 40,
      height: 40,

      borderRadius: 20,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#E8D8BD",

    },


    userAvatarText: {

      fontSize: 13,

      fontWeight: "900",

      color: "#7A551A",

    },


    userCardCopy: {

      flex: 1,

      marginHorizontal: 10,

    },


    userCardName: {

      fontSize: 12,

      fontWeight: "800",

      color: "#4C4137",

    },


    userCardMeta: {

      marginTop: 3,

      fontSize: 8,

      color: "#8E8072",

    },


    // ======================================================
    // MENU
    // ======================================================

    menuList: {

      marginTop: 14,

      gap: 7,

    },


    menuItem: {

      minHeight: 50,

      paddingHorizontal: 11,

      borderRadius: 12,

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#FFFFFF",

    },


    menuItemActive: {

      backgroundColor:
        "#F2E7D6",

    },


    menuItemIcon: {

      width: 34,
      height: 34,

      borderRadius: 10,

      alignItems:
        "center",

      justifyContent:
        "center",

      backgroundColor:
        "#F5EEE5",

    },


    menuItemIconActive: {

      backgroundColor:
        "#E8D5B5",

    },


    menuItemText: {

      flex: 1,

      marginLeft: 10,

      fontSize: 11,

      fontWeight: "700",

      color: "#5A4F45",

    },


    menuItemTextActive: {

      color: "#714D17",

    },


    activeDot: {

      width: 7,
      height: 7,

      borderRadius: 4,

      backgroundColor:
        "#9A6C20",

    },


    menuLanguageShortcut: {

      minHeight: 56,

      marginTop: 15,

      paddingHorizontal: 13,

      borderRadius: 13,

      borderWidth: 1,

      borderColor:
        "#DFD3C5",

      flexDirection:
        "row",

      alignItems:
        "center",

      backgroundColor:
        "#F7F1E8",

    },


    menuLanguageCopy: {

      flex: 1,

      marginLeft: 10,

    },


    menuLanguageLabel: {

      fontSize: 8,

      fontWeight: "700",

      color: "#948575",

    },


    menuLanguageValue: {

      marginTop: 2,

      fontSize: 11,

      fontWeight: "800",

      color: "#664A20",

    },

  });
