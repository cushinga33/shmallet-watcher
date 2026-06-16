import {FaCcAmex, FaCcApplePay, FaCcDiscover, FaCcMastercard, FaCcPaypal, FaCcVisa, FaCreditCard} from "react-icons/fa6";

export const cardIconDefs = [
    { name: "Amex", Icon: FaCcAmex },
    { name: "ApplePay", Icon: FaCcApplePay },
    { name: "Discover", Icon: FaCcDiscover },
    { name: "Mastercard", Icon: FaCcMastercard },
    { name: "Paypal", Icon: FaCcPaypal },
    { name: "Visa", Icon: FaCcVisa },
    { name: "CreditCard", Icon: FaCreditCard },
];

export function buildCardIcons(color, size) {
    return cardIconDefs.map(({ name, Icon }) => ({
        name,
        icon: <Icon color={color} size={size} />,
    }));
}

export function getCardIconByName(name, color, size) {
    const iconDef = cardIconDefs.find((icon) => icon.name === name);

    if (!iconDef) {
        return null;
    }

    const { Icon } = iconDef;
    return <Icon size={size} color={color} />;
}
