import React, { FormEvent, useState } from "react";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export default function EmailRegistration() {
  const [messageText, setMessageText] = useState<string>("");
  const [messageType, setMessageType] = useState<string>("success");
  const { i18n } = useLingui();

  const onSubmit = (event: FormEvent<HTMLFormElement>): boolean => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    fetch(
      form.action,
      {
        method: form.method,
        body: formData,
      },
    ).then((res) => {
      const email = formData.get("email") as string; // FormDataEntryValue can be File | string, we will always get a string in response
      const status = res.status;
      if (res.ok) {
        setMessageType("success");
        setMessageText(t`${email} has been successfully registered.`);
      } else {
        setMessageType("error");
        if (status === 422) {
          setMessageText(t`${email} is not a valid email address.`);
        } else if (status === 409) {
          setMessageText(t`${email} is already registered.`);
        } else {
          setMessageText(t`Error: ${status}`);
        }
      }
    });
    return false;
  };

  return (
    <div>
      <form method="post" action="https://www.disco2very.org/server/" id="register-email" onSubmit={onSubmit}>
        <input type="email" name="email" placeholder={t`myemail@myprovider.org`} autoComplete="email" required />
        <input type="hidden" name="language" value={i18n.locale} />
        <input type="submit" className="button" value={t`Register`} />
      </form>
      {messageText &&
        <div className={messageType + "-box"} style={{marginTop: "1rem"}}>
          {messageText}
        </div>
      }
      <div className="info" style={{textAlign: "center", marginTop: "1rem"}}><Trans>Please contact fla (a) framasoft.org to unregister</Trans></div>
    </div>
  );
}