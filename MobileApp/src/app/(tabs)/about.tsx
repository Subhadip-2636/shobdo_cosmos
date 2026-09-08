import {
  useMemo,
  type ReactNode,
} from "react";

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  ArrowRight,
  BookOpen,
  Feather,
  Globe2,
  HeartHandshake,
  Lightbulb,
  PenLine,
  Sparkles,
  Users,
} from "lucide-react-native";

import {
  router,
} from "expo-router";

import {
  useLanguage,
} from "../../Language/LanguageContext";

import Footer
  from "../../components/Footer";


// ==========================================================
// TYPES
// ==========================================================

type Copy = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  writeButton: string;
  exploreButton: string;
  cardTagline: string;

  visionEyebrow: string;
  visionTitle: string;
  visionDescription: string;

  goalTitle: string;
  goalDescription: string;

  communityTitle: string;
  communityDescription: string;

  languageTitle: string;
  languageDescription: string;

  beliefEyebrow: string;
  beliefTitle: string;
  beliefDescription: string;

  publishTitle: string;
  publishDescription: string;

  discoverTitle: string;
  discoverDescription: string;

  connectTitle: string;
  connectDescription: string;

  journeyEyebrow: string;
  journeyTitle: string;
  journeyDescription: string;

  stepIdea: string;
  stepIdeaDescription: string;

  stepWrite: string;
  stepWriteDescription: string;

  stepPublish: string;
  stepPublishDescription: string;

  finalEyebrow: string;
  finalTitle: string;
  finalDescription: string;
  finalButton: string;
};


// ==========================================================
// SCREEN
// ==========================================================

export default function AboutScreen() {

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
              "SHOBDO সম্পর্কে",
            heroTitle:
              "প্রতিটি ভাষার প্রতিটি কণ্ঠের জন্য একটি সাহিত্যিক স্থান",
            heroDescription:
              "SHOBDO একটি বহুভাষিক সাহিত্য ও সৃজনশীল প্রকাশের প্ল্যাটফর্ম, যেখানে মানুষ নিজের ভাষায় নিজের ভাবনা, গল্প, কবিতা ও অনুভূতি প্রকাশ করতে পারে।",
            writeButton:
              "লেখা শুরু করুন",
            exploreButton:
              "লেখা পড়ুন",
            cardTagline:
              "তোমার শব্দ, তোমার গল্প।",

            visionEyebrow:
              "আমাদের ভিত্তি",
            visionTitle:
              "ভাষা, প্রকাশ ও সম্প্রদায়কে কেন্দ্র করে তৈরি।",
            visionDescription:
              "SHOBDO এমন একটি ডিজিটাল সাহিত্যিক পরিবেশ তৈরি করতে চায়, যেখানে প্রতিটি লেখকের কণ্ঠকে গুরুত্ব দেওয়া হয়—এবং তাকে আরও মানুষের কাছে পৌঁছে দেওয়া হয়।",

            goalTitle:
              "আমাদের লক্ষ্য",
            goalDescription:
              "আঞ্চলিক ও ভারতীয় ভাষার লেখক এবং পাঠকদের জন্য একটি সুন্দর, সহজ, নিরাপদ ও অন্তর্ভুক্তিমূলক ডিজিটাল সাহিত্যিক স্থান তৈরি করা।",

            communityTitle:
              "সম্প্রদায়",
            communityDescription:
              "বিভিন্ন ভাষা, অঞ্চল, অভিজ্ঞতা ও দৃষ্টিভঙ্গির মানুষকে সাহিত্য এবং সৃজনশীল লেখার মাধ্যমে যুক্ত করা।",

            languageTitle:
              "ভাষাই কেন্দ্রবিন্দু",
            languageDescription:
              "লেখক যেন নিজের স্বাভাবিক ভাষাতেই লিখতে পারেন—SHOBDO সেই স্বাধীনতাকে প্ল্যাটফর্মের মূল দর্শন হিসেবে ধরে রাখে।",

            beliefEyebrow:
              "কেন SHOBDO",
            beliefTitle:
              "কারণ অর্থপূর্ণ লেখা ভাষার সীমায় আটকে থাকা উচিত নয়।",
            beliefDescription:
              "ভাষা শুধু যোগাযোগের মাধ্যম নয়; এটি স্মৃতি, সংস্কৃতি, পরিচয় এবং অনুভূতির ধারক। SHOBDO সেই বৈচিত্র্যকে সম্মান করে।",

            publishTitle:
              "প্রকাশ",
            publishDescription:
              "কবিতা, গল্প, প্রবন্ধ কিংবা ব্যক্তিগত অনুভূতি—নিজের ভাষায় পরিচয় অক্ষুণ্ণ রেখে প্রকাশ করুন।",

            discoverTitle:
              "আবিষ্কার",
            discoverDescription:
              "বিভিন্ন বিভাগ, অঞ্চল ও ভাষার নতুন লেখক এবং নতুন চিন্তার সঙ্গে পরিচিত হন।",

            connectTitle:
              "আদানপ্রদান",
            connectDescription:
              "এমন একটি সাহিত্যিক পরিসর, যেখানে ভাষা বিভাজন নয়—সংযোগের সেতু হয়ে ওঠে।",

            journeyEyebrow:
              "কীভাবে কাজ করে",
            journeyTitle:
              "একটি ভাবনা থেকে প্রকাশিত লেখায়।",
            journeyDescription:
              "SHOBDO লেখার প্রক্রিয়াকে সহজ রাখে, যাতে মনোযোগ থাকে আপনার শব্দ, ভাবনা এবং কণ্ঠের ওপর।",

            stepIdea:
              "ভাবনা",
            stepIdeaDescription:
              "একটি অনুভূতি, ঘটনা, প্রশ্ন বা গল্প থেকে শুরু করুন।",

            stepWrite:
              "লিখুন",
            stepWriteDescription:
              "নিজের ভাষায় স্বাধীনভাবে লিখুন এবং প্রয়োজনে খসড়া হিসেবে সংরক্ষণ করুন।",

            stepPublish:
              "প্রকাশ করুন",
            stepPublishDescription:
              "লেখাটি প্রস্তুত হলে SHOBDO সম্প্রদায়ের সঙ্গে ভাগ করে নিন।",

            finalEyebrow:
              "আপনার কণ্ঠ গুরুত্বপূর্ণ",
            finalTitle:
              "আপনার শব্দকে আপনার ভাষায় পৃথিবীর সামনে তুলে ধরুন।",
            finalDescription:
              "একটি লেখা কখনও শুধু লেখা নয়—এটি অভিজ্ঞতা, পরিচয় এবং মানুষের সঙ্গে সংযোগের শুরু হতে পারে।",
            finalButton:
              "এখনই লিখুন",
          };

        }


        if (
          language === "hi"
        ) {

          return {
            eyebrow:
              "SHOBDO के बारे में",
            heroTitle:
              "हर भाषा की हर आवाज़ के लिए एक साहित्यिक स्थान",
            heroDescription:
              "SHOBDO एक बहुभाषी साहित्यिक और रचनात्मक मंच है जहाँ लोग अपनी भाषा में अपने विचार, कहानी, कविता और भावनाएँ साझा कर सकते हैं।",
            writeButton:
              "लिखना शुरू करें",
            exploreButton:
              "रचनाएँ पढ़ें",
            cardTagline:
              "आपके शब्द, आपकी कहानी।",

            visionEyebrow:
              "हमारी नींव",
            visionTitle:
              "भाषा, अभिव्यक्ति और समुदाय को केंद्र में रखकर बनाया गया।",
            visionDescription:
              "SHOBDO ऐसा डिजिटल साहित्यिक वातावरण बनाना चाहता है जहाँ हर लेखक की आवाज़ को महत्व मिले और वह अधिक पाठकों तक पहुँच सके।",

            goalTitle:
              "हमारा लक्ष्य",
            goalDescription:
              "भारतीय और क्षेत्रीय भाषाओं के लेखकों और पाठकों के लिए सुंदर, सरल, सुरक्षित और समावेशी डिजिटल साहित्यिक स्थान बनाना।",

            communityTitle:
              "समुदाय",
            communityDescription:
              "अलग-अलग भाषाओं, क्षेत्रों, अनुभवों और दृष्टिकोणों के लोगों को साहित्य और रचनात्मक लेखन के माध्यम से जोड़ना।",

            languageTitle:
              "भाषा केंद्र में",
            languageDescription:
              "लेखक अपनी स्वाभाविक भाषा में लिख सके—SHOBDO इस स्वतंत्रता को अपने मूल विचार के रूप में रखता है।",

            beliefEyebrow:
              "क्यों SHOBDO",
            beliefTitle:
              "क्योंकि अर्थपूर्ण लेखन भाषा की सीमाओं में बंद नहीं होना चाहिए।",
            beliefDescription:
              "भाषा केवल संवाद का माध्यम नहीं; यह स्मृति, संस्कृति, पहचान और भावना की वाहक है। SHOBDO इस विविधता का सम्मान करता है।",

            publishTitle:
              "प्रकाशित करें",
            publishDescription:
              "कविता, कहानी, लेख या निजी भावना—अपनी भाषा और पहचान को बनाए रखते हुए साझा करें।",

            discoverTitle:
              "खोजें",
            discoverDescription:
              "अलग-अलग श्रेणियों, क्षेत्रों और भाषाओं के नए लेखक और नए विचार खोजें।",

            connectTitle:
              "जुड़ें",
            connectDescription:
              "ऐसा साहित्यिक स्थान जहाँ भाषा विभाजन नहीं बल्कि जुड़ने का पुल बने।",

            journeyEyebrow:
              "कैसे काम करता है",
            journeyTitle:
              "एक विचार से प्रकाशित रचना तक।",
            journeyDescription:
              "SHOBDO लेखन प्रक्रिया को सरल रखता है ताकि आपका ध्यान आपके शब्दों, विचारों और आवाज़ पर रहे।",

            stepIdea:
              "विचार",
            stepIdeaDescription:
              "किसी भावना, घटना, प्रश्न या कहानी से शुरुआत करें।",

            stepWrite:
              "लिखें",
            stepWriteDescription:
              "अपनी भाषा में स्वतंत्र रूप से लिखें और चाहें तो ड्राफ़्ट के रूप में सेव करें।",

            stepPublish:
              "प्रकाशित करें",
            stepPublishDescription:
              "रचना तैयार होने पर उसे SHOBDO समुदाय के साथ साझा करें।",

            finalEyebrow:
              "आपकी आवाज़ महत्वपूर्ण है",
            finalTitle:
              "अपने शब्दों को अपनी भाषा में दुनिया के सामने रखें।",
            finalDescription:
              "एक रचना केवल रचना नहीं होती—यह अनुभव, पहचान और लोगों से जुड़ने की शुरुआत हो सकती है।",
            finalButton:
              "अभी लिखें",
          };

        }


        return {
          eyebrow:
            "ABOUT SHOBDO",
          heroTitle:
            "A literary space for every voice in every language",
          heroDescription:
            "SHOBDO is a multilingual literature and creative-expression platform where people can share thoughts, stories, poems and feelings in their own language.",
          writeButton:
            "Start Writing",
          exploreButton:
            "Explore Writings",
          cardTagline:
            "Your words, your story.",

          visionEyebrow:
            "OUR FOUNDATION",
          visionTitle:
            "Built around language, expression and community.",
          visionDescription:
            "SHOBDO aims to create a digital literary environment where every writer's voice matters—and can reach more readers.",

          goalTitle:
            "Our Goal",
          goalDescription:
            "Create a beautiful, simple, safe and inclusive digital literary space for writers and readers of Indian and regional languages.",

          communityTitle:
            "Community",
          communityDescription:
            "Connect people from different languages, regions, experiences and perspectives through literature and creative writing.",

          languageTitle:
            "Language at the Centre",
          languageDescription:
            "Writers should be able to write naturally in their own language. SHOBDO keeps that freedom at the centre of the platform.",

          beliefEyebrow:
            "WHY SHOBDO",
          beliefTitle:
            "Because meaningful writing should not be trapped by language boundaries.",
          beliefDescription:
            "Language is more than communication. It carries memory, culture, identity and emotion. SHOBDO respects that diversity.",

          publishTitle:
            "Publish",
          publishDescription:
            "Share poems, stories, essays or personal feelings while preserving your language and identity.",

          discoverTitle:
            "Discover",
          discoverDescription:
            "Meet new writers and new ideas across categories, regions and languages.",

          connectTitle:
            "Connect",
          connectDescription:
            "A literary space where language becomes a bridge for connection rather than a barrier.",

          journeyEyebrow:
            "HOW IT WORKS",
          journeyTitle:
            "From an idea to a published writing.",
          journeyDescription:
            "SHOBDO keeps the writing process simple so your attention remains on your words, thoughts and voice.",

          stepIdea:
            "Idea",
          stepIdeaDescription:
            "Begin with a feeling, event, question or story.",

          stepWrite:
            "Write",
          stepWriteDescription:
            "Write freely in your language and save it as a draft whenever you need.",

          stepPublish:
            "Publish",
          stepPublishDescription:
            "When your writing is ready, share it with the SHOBDO community.",

          finalEyebrow:
            "YOUR VOICE MATTERS",
          finalTitle:
            "Bring your words to the world in your own language.",
          finalDescription:
            "A piece of writing can become more than text—it can be the beginning of experience, identity and human connection.",
          finalButton:
            "Write Now",
        };

      },
      [
        language,
      ]
    );


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
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* ==================================================
            HERO
        ================================================== */}

        <View
          style={
            styles.hero
          }
        >

          <View
            style={
              styles.heroCopy
            }
          >

            <View
              style={
                styles.eyebrowRow
              }
            >
              <Sparkles
                size={14}
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
                styles.heroTitle
              }
            >
              {copy.heroTitle}
            </Text>


            <Text
              style={
                styles.heroDescription
              }
            >
              {copy.heroDescription}
            </Text>


            <View
              style={
                styles.heroActions
              }
            >

              <TouchableOpacity
                activeOpacity={0.84}
                style={
                  styles.primaryButton
                }
                onPress={() =>
                  router.push(
                    "/(tabs)/write"
                  )
                }
              >
                <PenLine
                  size={16}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  {copy.writeButton}
                </Text>
              </TouchableOpacity>


              <TouchableOpacity
                activeOpacity={0.84}
                style={
                  styles.secondaryButton
                }
                onPress={() =>
                  router.push(
                    "/(tabs)/explore"
                  )
                }
              >
                <BookOpen
                  size={16}
                  color="#765820"
                />

                <Text
                  style={
                    styles.secondaryButtonText
                  }
                >
                  {copy.exploreButton}
                </Text>
              </TouchableOpacity>

            </View>

          </View>


          <View
            style={
              styles.brandCard
            }
          >
            <View
              style={
                styles.brandCircle
              }
            >
              <Feather
                size={30}
                color="#9A6C20"
              />
            </View>

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

            <View
              style={
                styles.brandLine
              }
            />

            <Text
              style={
                styles.brandTagline
              }
            >
              {copy.cardTagline}
            </Text>
          </View>

        </View>


        {/* ==================================================
            DARK QUOTE BAND
        ================================================== */}

        <View
          style={
            styles.quoteBand
          }
        >
          <Feather
            size={20}
            color="#B78A43"
          />

          <Text
            style={
              styles.quoteText
            }
          >
            {copy.heroTitle}
          </Text>
        </View>


        {/* ==================================================
            FOUNDATION
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionEyebrow
            }
          >
            {copy.visionEyebrow}
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {copy.visionTitle}
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            {copy.visionDescription}
          </Text>


          <View
            style={
              styles.cards
            }
          >
            <InfoCard
              number="01"
              icon={
                <Feather
                  size={20}
                  color="#A2752A"
                />
              }
              title={
                copy.goalTitle
              }
              description={
                copy.goalDescription
              }
            />

            <InfoCard
              number="02"
              icon={
                <Users
                  size={20}
                  color="#A2752A"
                />
              }
              title={
                copy.communityTitle
              }
              description={
                copy.communityDescription
              }
            />

            <InfoCard
              number="03"
              icon={
                <Globe2
                  size={20}
                  color="#A2752A"
                />
              }
              title={
                copy.languageTitle
              }
              description={
                copy.languageDescription
              }
            />
          </View>
        </View>


        {/* ==================================================
            DARK BELIEF SECTION
        ================================================== */}

        <View
          style={
            styles.darkSection
          }
        >
          <Text
            style={
              styles.darkEyebrow
            }
          >
            {copy.beliefEyebrow}
          </Text>

          <Text
            style={
              styles.darkTitle
            }
          >
            {copy.beliefTitle}
          </Text>

          <Text
            style={
              styles.darkDescription
            }
          >
            {copy.beliefDescription}
          </Text>


          <View
            style={
              styles.darkItems
            }
          >
            <DarkItem
              number="01"
              title={
                copy.publishTitle
              }
              description={
                copy.publishDescription
              }
            />

            <DarkItem
              number="02"
              title={
                copy.discoverTitle
              }
              description={
                copy.discoverDescription
              }
            />

            <DarkItem
              number="03"
              title={
                copy.connectTitle
              }
              description={
                copy.connectDescription
              }
            />
          </View>
        </View>


        {/* ==================================================
            JOURNEY
        ================================================== */}

        <View
          style={
            styles.section
          }
        >
          <Text
            style={
              styles.sectionEyebrow
            }
          >
            {copy.journeyEyebrow}
          </Text>

          <Text
            style={
              styles.sectionTitle
            }
          >
            {copy.journeyTitle}
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            {copy.journeyDescription}
          </Text>


          <View
            style={
              styles.journey
            }
          >
            <JourneyItem
              number="01"
              icon={
                <Lightbulb
                  size={19}
                  color="#936A25"
                />
              }
              title={
                copy.stepIdea
              }
              description={
                copy.stepIdeaDescription
              }
            />

            <JourneyItem
              number="02"
              icon={
                <PenLine
                  size={19}
                  color="#936A25"
                />
              }
              title={
                copy.stepWrite
              }
              description={
                copy.stepWriteDescription
              }
            />

            <JourneyItem
              number="03"
              icon={
                <BookOpen
                  size={19}
                  color="#936A25"
                />
              }
              title={
                copy.stepPublish
              }
              description={
                copy.stepPublishDescription
              }
            />
          </View>
        </View>


        {/* ==================================================
            COMMUNITY NOTE
        ================================================== */}

        <View
          style={
            styles.communityNote
          }
        >
          <View
            style={
              styles.communityIcon
            }
          >
            <HeartHandshake
              size={22}
              color="#9A6C20"
            />
          </View>

          <View
            style={
              styles.communityCopy
            }
          >
            <Text
              style={
                styles.communityTitle
              }
            >
              {copy.finalEyebrow}
            </Text>

            <Text
              style={
                styles.communityDescription
              }
            >
              {copy.finalDescription}
            </Text>
          </View>
        </View>


        {/* ==================================================
            FINAL CTA
        ================================================== */}

        <View
          style={
            styles.finalCta
          }
        >
          <Text
            style={
              styles.finalEyebrow
            }
          >
            {copy.finalEyebrow}
          </Text>

          <Text
            style={
              styles.finalTitle
            }
          >
            {copy.finalTitle}
          </Text>

          <Text
            style={
              styles.finalDescription
            }
          >
            {copy.finalDescription}
          </Text>

          <TouchableOpacity
            activeOpacity={0.84}
            style={
              styles.finalButton
            }
            onPress={() =>
              router.push(
                "/(tabs)/write"
              )
            }
          >
            <PenLine
              size={16}
              color="#251F1B"
            />

            <Text
              style={
                styles.finalButtonText
              }
            >
              {copy.finalButton}
            </Text>

            <ArrowRight
              size={16}
              color="#251F1B"
            />
          </TouchableOpacity>
        </View>


        <Footer />

      </ScrollView>

    </SafeAreaView>

  );

}


// ==========================================================
// INFO CARD
// ==========================================================

function InfoCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {

  return (
    <View
      style={
        styles.infoCard
      }
    >
      <View
        style={
          styles.infoTop
        }
      >
        <Text
          style={
            styles.infoNumber
          }
        >
          {number}
        </Text>

        {icon}
      </View>

      <Text
        style={
          styles.infoTitle
        }
      >
        {title}
      </Text>

      <Text
        style={
          styles.infoDescription
        }
      >
        {description}
      </Text>
    </View>
  );

}


// ==========================================================
// DARK ITEM
// ==========================================================

function DarkItem({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {

  return (
    <View
      style={
        styles.darkItem
      }
    >
      <Text
        style={
          styles.darkNumber
        }
      >
        {number}
      </Text>

      <View
        style={
          styles.darkItemCopy
        }
      >
        <Text
          style={
            styles.darkItemTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.darkItemDescription
          }
        >
          {description}
        </Text>
      </View>
    </View>
  );

}


// ==========================================================
// JOURNEY ITEM
// ==========================================================

function JourneyItem({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {

  return (
    <View
      style={
        styles.journeyItem
      }
    >
      <View
        style={
          styles.journeyIcon
        }
      >
        {icon}
      </View>

      <View
        style={
          styles.journeyCopy
        }
      >
        <Text
          style={
            styles.journeyNumber
          }
        >
          {number}
        </Text>

        <Text
          style={
            styles.journeyTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.journeyDescription
          }
        >
          {description}
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

    safeArea: {
      flex: 1,
      backgroundColor:
        "#F8F5EF",
    },

    scroll: {
      flex: 1,
    },

    content: {
      paddingBottom: 0,
    },


    // ======================================================
    // HERO
    // ======================================================

    hero: {
      paddingHorizontal: 18,
      paddingTop: 28,
      paddingBottom: 28,
      backgroundColor:
        "#F6F0E6",
    },

    heroCopy: {
      width: "100%",
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

    heroTitle: {
      marginTop: 13,
      fontSize: 34,
      lineHeight: 42,
      fontWeight: "900",
      letterSpacing: -0.6,
      color: "#26211D",
    },

    heroDescription: {
      marginTop: 15,
      maxWidth: 350,
      fontSize: 12,
      lineHeight: 21,
      color: "#766B60",
    },

    heroActions: {
      marginTop: 20,
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 9,
    },

    primaryButton: {
      minHeight: 47,
      paddingHorizontal: 15,
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        "#29231F",
    },

    primaryButtonText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    secondaryButton: {
      minHeight: 47,
      paddingHorizontal: 15,
      borderRadius: 10,
      borderWidth: 1,
      borderColor:
        "#D6C8B5",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        "#FFFDF8",
    },

    secondaryButtonText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#765820",
    },

    brandCard: {
      minHeight: 270,
      marginTop: 25,
      padding: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#D9CDBE",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFDF9",
    },

    brandCircle: {
      width: 66,
      height: 66,
      borderRadius: 33,
      borderWidth: 1,
      borderColor:
        "#CDAE73",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    brandName: {
      marginTop: 17,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 4,
      color: "#4A2467",
    },

    brandBengali: {
      marginTop: 3,
      fontSize: 8,
      color: "#8B7B6A",
    },

    brandLine: {
      width: 38,
      height: 1,
      marginTop: 20,
      backgroundColor:
        "#B88A3F",
    },

    brandTagline: {
      marginTop: 16,
      fontSize: 11,
      fontStyle: "italic",
      color: "#837363",
    },


    // ======================================================
    // QUOTE
    // ======================================================

    quoteBand: {
      paddingHorizontal: 24,
      paddingVertical: 34,
      alignItems:
        "center",
      backgroundColor:
        "#211C18",
    },

    quoteText: {
      marginTop: 12,
      maxWidth: 330,
      textAlign:
        "center",
      fontSize: 20,
      lineHeight: 30,
      fontWeight: "700",
      color: "#F5EEE5",
    },


    // ======================================================
    // LIGHT SECTION
    // ======================================================

    section: {
      paddingHorizontal: 18,
      paddingVertical: 34,
      backgroundColor:
        "#FBF9F5",
    },

    sectionEyebrow: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1.5,
      color: "#9B6F27",
    },

    sectionTitle: {
      marginTop: 10,
      maxWidth: 350,
      fontSize: 28,
      lineHeight: 36,
      fontWeight: "900",
      color: "#2E2823",
    },

    sectionDescription: {
      marginTop: 10,
      maxWidth: 350,
      fontSize: 11,
      lineHeight: 19,
      color: "#7A6E62",
    },

    cards: {
      marginTop: 22,
      gap: 12,
    },

    infoCard: {
      minHeight: 205,
      padding: 18,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#DDD3C7",
      backgroundColor:
        "#FFFDF9",
    },

    infoTop: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    infoNumber: {
      fontSize: 8,
      fontWeight: "800",
      color: "#AA9A87",
    },

    infoTitle: {
      marginTop: 43,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "900",
      color: "#342E29",
    },

    infoDescription: {
      marginTop: 8,
      fontSize: 10,
      lineHeight: 17,
      color: "#817568",
    },


    // ======================================================
    // DARK SECTION
    // ======================================================

    darkSection: {
      paddingHorizontal: 18,
      paddingVertical: 36,
      backgroundColor:
        "#201B17",
    },

    darkEyebrow: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1.6,
      color: "#B88B43",
    },

    darkTitle: {
      marginTop: 11,
      fontSize: 30,
      lineHeight: 39,
      fontWeight: "900",
      color: "#F5EEE6",
    },

    darkDescription: {
      marginTop: 12,
      fontSize: 11,
      lineHeight: 20,
      color: "#D2C5B7",
    },

    darkItems: {
      marginTop: 25,
      borderTopWidth: 1,
      borderTopColor:
        "#453C34",
    },

    darkItem: {
      paddingVertical: 18,
      borderBottomWidth: 1,
      borderBottomColor:
        "#453C34",
      flexDirection:
        "row",
    },

    darkNumber: {
      width: 35,
      fontSize: 8,
      fontWeight: "800",
      color: "#A67937",
    },

    darkItemCopy: {
      flex: 1,
    },

    darkItemTitle: {
      fontSize: 17,
      fontWeight: "900",
      color: "#F5EEE6",
    },

    darkItemDescription: {
      marginTop: 6,
      fontSize: 9,
      lineHeight: 16,
      color: "#BCAE9F",
    },


    // ======================================================
    // JOURNEY
    // ======================================================

    journey: {
      marginTop: 22,
      gap: 10,
    },

    journeyItem: {
      minHeight: 115,
      padding: 15,
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#DDD2C6",
      flexDirection:
        "row",
      backgroundColor:
        "#FFFDF9",
    },

    journeyIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F1E5D2",
    },

    journeyCopy: {
      flex: 1,
      marginLeft: 12,
    },

    journeyNumber: {
      fontSize: 7,
      fontWeight: "800",
      color: "#AA9780",
    },

    journeyTitle: {
      marginTop: 4,
      fontSize: 15,
      fontWeight: "900",
      color: "#443A31",
    },

    journeyDescription: {
      marginTop: 5,
      fontSize: 9,
      lineHeight: 15,
      color: "#817568",
    },


    // ======================================================
    // COMMUNITY NOTE
    // ======================================================

    communityNote: {
      marginHorizontal: 18,
      marginBottom: 34,
      padding: 17,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#DECAB0",
      flexDirection:
        "row",
      backgroundColor:
        "#F2E4CF",
    },

    communityIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFF9EF",
    },

    communityCopy: {
      flex: 1,
      marginLeft: 11,
    },

    communityTitle: {
      fontSize: 10,
      fontWeight: "900",
      color: "#654A25",
    },

    communityDescription: {
      marginTop: 4,
      fontSize: 8,
      lineHeight: 14,
      color: "#8C7558",
    },


    // ======================================================
    // FINAL CTA
    // ======================================================

    finalCta: {
      paddingHorizontal: 18,
      paddingVertical: 36,
      backgroundColor:
        "#211C18",
    },

    finalEyebrow: {
      fontSize: 8,
      fontWeight: "900",
      letterSpacing: 1.5,
      color: "#B98B42",
    },

    finalTitle: {
      marginTop: 10,
      fontSize: 29,
      lineHeight: 38,
      fontWeight: "900",
      color: "#F5EEE5",
    },

    finalDescription: {
      marginTop: 11,
      fontSize: 10,
      lineHeight: 18,
      color: "#BFB2A5",
    },

    finalButton: {
      alignSelf:
        "flex-start",
      minHeight: 46,
      marginTop: 18,
      paddingHorizontal: 15,
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 7,
      backgroundColor:
        "#E7D2A7",
    },

    finalButtonText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#251F1B",
    },

  });
