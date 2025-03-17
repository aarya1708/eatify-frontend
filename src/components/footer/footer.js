import './footer.css'

function footer() {
    return (
        <>
            <footer style={{ backgroundColor: "black" }}>
                <div className="footer">
                    <div className="ft">
                        <h2 style={{color:'black'}}>About Us</h2>
                        <br />
                        Our Values
                        <br />
                        Privacy Policy
                        <br />
                        Terms and Conditions
                        <br />
                        Distributor Queries
                        <br />
                        Disclaimer
                        <br />
                        Media Outreach
                    </div>
                    <div className="ft">
                        <h2 style={{color:'black'}}>Quick Links</h2>
                        <br />
                        Knowledge
                        <br />
                        FAQs
                        <br />
                        Return and Refund Policy
                        <br />
                        Track Order
                        <br />
                        Download App
                    </div>
                    <div className="ft">
                        <h2 style={{color:'black'}}>Contact Us</h2>
                        <br />
                        Need help fast? Email us at
                        <br />
                        help@eatify.co
                        <br /><br/>
                        <hr />
                        <img src={require('./ig_icon.png')} width="30px" height="30px" />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <img src={require('./mail_icon.png')} width="30px" height="30px" />
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <img src={require('./fb_icon.png')} width="29px" height="29px" />
                    </div>
                </div>
            </footer>

        </>
    );
}

export default footer;