import React from "react";
import { Image, View } from "react-native";
import Swiper from 'react-native-swiper';
import useStore from "../../store/store";
import { mainServerPath } from "../../utils/serverPath";
import Style from "./Style";

const Slider = (props) =>
{
	const globalState = useStore()[0];
    // console.log("Rendering [Slider.js]");
    return (
        <View style={Style.container}>
            {globalState.sliders.length >= 1 && (
                <Swiper
                    style={Style.wrapper}
                    {...props}
                    showsButtons={false}
                    autoplay={true}
                    loop={true}
                    dotStyle={{ width: 0, height: 0 }}
                    activeDotStyle={{ width: 0, height: 0 }}
                    containerStyle={{ maxHeight: 200 }}
                >
                    {globalState.sliders.map((image, index) => (
                        <View style={Style.slider} key={image.id}>
                            <Image
                                source={{ uri: mainServerPath(image.imagePath) }}
                                style={Style.image}
                            />
                        </View>
                    ))}
                </Swiper>
            )}
        </View>
    )
};

export default React.memo(Slider, (next, prev) => (
    next.autoplay === prev.autoplay
));


// import React, { useState } from "react";
// import { Image, View } from "react-native";
// import Swiper from 'react-native-swiper';
// import { mainServerPath } from "../../utils/serverPath";
// import Style from "./Style";

// const Slider = (props) =>
// {
//     const [loadedCount, setLoadedCount] = useState(0);

//     const handleImageLoad = () => {
//         setLoadedCount(prev => prev + 1);
//     };

//     const allImagesLoaded = props?.images?.length === loadedCount;

//     // console.log("Rendering [Slider.js]");
//     return (
//         <View style={Style.container}>
//             {allImagesLoaded && (
//                 <Swiper
//                     style={Style.wrapper}
//                     {...props}
//                     showsButtons={false}
//                     autoplay={true}
//                     loop={true}
//                     dotStyle={{ width: 0, height: 0 }}
//                     activeDotStyle={{ width: 0, height: 0 }}
//                     containerStyle={{ maxHeight: 200 }}
//                 >
//                     {props.images.map((image, index) => (
//                         <View style={Style.slider} key={image.id}>
//                             <Image
//                                 source={{ uri: mainServerPath(image.imagePath) }}
//                                 style={Style.image}
//                             />
//                         </View>
//                     ))}
//                 </Swiper>
//             )}

//             {/* preload images (invisible) */}
//             {props.images.map((image, index) => (
//                 <Image
//                     key={index}
//                     source={{ uri: mainServerPath(image.imagePath) }}
//                     style={{ width: 0, height: 0 }}
//                     onLoad={handleImageLoad}
//                 />
//             ))}
//         </View>
//     )
// };

// // export default Slider;
// export default React.memo(Slider, (next, prev) => (
//     next.images === prev.images &&
//     next.autoplay === prev.autoplay
// ));