import React, { useRef } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import Share from "react-native-share";
import ViewShot, { captureRef } from "react-native-view-shot";
import Colors from "../../constant";
import language from "../../localization";
import Button from "../Button";
import Card from "../Card";
import Style from "./Style";

const QRcodeGenerator = (props) =>
{
  const socialConfig = [
    { key: "whatsapp", label: "WhatsApp Number" },
    { key: "facebook", label: "Facebook Link" },
    { key: "instagram", label: "Instagram Link" },
    { key: "telegram", label: "Telegram Link" },
    { key: "linkedin", label: "LinkedIn Link" },
    { key: "youtube", label: "YouTube Link" },
    { key: "tiktok", label: "TikTok Link" },
    { key: "twitter", label: "Twitter Link" },
  ];

  const socialLinks = props?.socialLinks || {};

  const output = socialConfig
    .filter(({ key }) => socialLinks[key]?.trim())
    .map(({ key, label }) => `${label}: ${socialLinks[key]}`)
    .join("\n");

  const viewRef = useRef();

  const shareHandler = async () =>
  {
    try {
      const uri = await captureRef(viewRef.current, {
        format: 'jpg',
        quality: 0.8,
      });

      await Share.open({
        url: 'file://' + uri, // prepend file:// for local image
        type: 'image/jpeg',
        failOnCancel: false,
      });
    } catch (error) {
      console.error("Sharing error:", error);
    }

    props.onDismiss();
  }

  return (
    <View>
       <Modal
        visible={props.visible}
        animationType="slide"
        transparent={true}
      >
        <View style={Style.content}>
          <Card style={Style.card} activeOpacity={1}>
            <ViewShot ref={viewRef} options={{ format: "jpg", quality: 0.9 }} collapsable={false}>
              <View style={Style.qrCodeContainer}>
                <Text style={Style.title}>{language.shareYourSocial}</Text>
                <QRCode
                  value={output || "No social media information provided"}
                  size={200}
                  color="#000" 
                  backgroundColor={Colors.white}
                />
              </View>
            </ViewShot>

            <View style={Style.buttonsContainer}>
              <Button style={Style.dismiss} onPress={props.onDismiss}>{language.dismiss}</Button>
              <Button style={Style.share} onPress={shareHandler}>{language.share}</Button>
            </View>
          </Card>
        </View>
        <TouchableOpacity style={Style.backdrop} onPress={props.onDismiss} activeOpacity={1}>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default QRcodeGenerator;