/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { addPreSendListener, removePreSendListener } from "@api/MessageEvents";
import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { getCurrentChannel } from "@utils/discord";
import definePlugin, { OptionType } from "@utils/types";

const link_regex = /(?<!<)(https?:\/\/[^\s)]+)(?!>)/g;

const settings = definePluginSettings({
    dmOnly: {
        type: OptionType.BOOLEAN,
        default: false,
        description: "Only add the signature to DM messages",
    },
    signatureText: {
        type: OptionType.STRING,
        default: "Signature for [**Vencord**](https://vencord.dev/)",
        description: "Your signature content"
    },
    disableLinkEmbeds: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Disable link embeds in the signature",
    },
});

export default definePlugin({
    name: "MessageSignature",
    description: "Allows you to add a signature to your messages",
    authors: [Devs.imxnoobx],
    dependencies: ["MessageEventsAPI"],

    settings,

    async start() {
        this.preSend = addPreSendListener((channelId, msg) => {
            const message = msg.content;
            let signature = settings.store.signatureText;

            if (
                message.length === 0 ||
                signature.length === 0
            )
                return;

            if (settings.store.dmOnly && getCurrentChannel().guild_id)
                return;

            if (settings.store.disableLinkEmbeds)
                signature = signature.replace(link_regex, "<$1>");

            while (signature.trim().startsWith("#"))
                signature = signature.slice(1);

            console.log(signature);

            msg.content += `\n-# ${signature}`;
        });
    },

    stop() {
        removePreSendListener(this.preSend);
    }
});
