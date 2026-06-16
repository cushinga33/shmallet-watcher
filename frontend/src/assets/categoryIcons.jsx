import { FaCartShopping, FaSackDollar, FaBoltLightning, FaBook, FaGift, FaGasPump } from "react-icons/fa6";
import { FaCar, FaHome, FaUtensils, FaBriefcaseMedical, FaTshirt, FaGamepad, FaCocktail, FaPaw, FaStarOfLife } from "react-icons/fa";
import { IoAirplane } from "react-icons/io5";

export const categoryIconDefs = [
    { name: "FaSackDollar", Icon: FaSackDollar },
    { name: "FaHome", Icon: FaHome },
    { name: "FaBoltLightning", Icon: FaBoltLightning },
    { name: "FaCartShopping", Icon: FaCartShopping },
    { name: "FaCar", Icon: FaCar },
    { name: "FaGasPump", Icon: FaGasPump },
    { name: "FaUtensils", Icon: FaUtensils },
    { name: "FaBriefcaseMedical", Icon: FaBriefcaseMedical },
    { name: "FaTshirt", Icon: FaTshirt },
    { name: "FaBook", Icon: FaBook },
    { name: "FaGamepad", Icon: FaGamepad },
    { name: "FaCocktail", Icon: FaCocktail },
    { name: "FaPaw", Icon: FaPaw },
    { name: "IoAirplane", Icon: IoAirplane },
    { name: "FaGift", Icon: FaGift },
    { name: "FaStarOfLife", Icon: FaStarOfLife },
];

export function buildCategoryIcons(color, size = 24) {
    return categoryIconDefs.map(({ name, Icon }) => ({
        name,
        icon: <Icon size={size} color={color} />,
    }));
}

export function getCategoryIconByName(name, color, size = 20) {
    const iconDef = categoryIconDefs.find((icon) => icon.name === name);

    if (!iconDef) {
        return null;
    }

    const { Icon } = iconDef;
    return <Icon size={size} color={color} />;
}
