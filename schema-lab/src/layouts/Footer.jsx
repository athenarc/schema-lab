import React from 'react';
import config from "../config/config.json"

const Footer = () => {
    const { footer } = config;
    
    return (
        <footer className="bg-light text-center">
            <p>
                {footer.footerMainText} <a href={footer.footerLink} className='primary'>{footer.footerLinkText}</a>, 
                <br /> {footer.footerExtraText}
            </p>
        </footer>
    );
};

export default Footer;