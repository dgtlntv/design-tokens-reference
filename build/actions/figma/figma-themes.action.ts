import fs from "fs/promises"
import path from "path"
import type { Action } from "style-dictionary/types"

export const figmaThemesAction: Action = {
    name: "figma-themes",
    do: async (dictionary, config) => {
        const buildPath = config.buildPath || "dist/figma/"
        const themesPath = path.join(buildPath, "$themes.json")

        const themes = [
            {
                id: "e0f60821fe4d7d695fb5a701cca50f6814bcf366",
                name: "default",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/color/primitive": "enabled",
                },
                group: "color-primitive",
                $figmaCollectionId: "VariableCollectionId:1:2",
                $figmaModeId: "1:0",
                $figmaVariableReferences: {
                    "color.orange.100":
                        "792e29db680b41eb3c07aef2cc763df7cccc9ed2",
                    "color.orange.200":
                        "7cd95eda80d99b1e8b7760e57722abd7620ae988",
                    "color.orange.300":
                        "28bd7d5391fcd70c3e044c626b5e2df886a764bb",
                    "color.orange.400":
                        "73a418fb486987d53f287e809ae958b1c6ed3da5",
                    "color.orange.500":
                        "8bc7712e213cf1c97f7ada884314117bcf0215da",
                    "color.orange.600":
                        "bf33c855a9fe11bff326b7cf7e5c1bc8ce3bf868",
                    "color.orange.700":
                        "b1d76da5d685d440e51c368b75a63a4d2f42d035",
                    "color.orange.800":
                        "df810d605f21c6a9f9f58848421f8c6913c63203",
                    "color.orange.900":
                        "c71072bc4ac291eebf933b7a1574efe46bf557a0",
                    "color.orange.1000":
                        "c69aa2a8c8208e12f4e3a3bfc939f106350d2501",
                    "color.teal.100":
                        "da0ac3fe60eae974fefc0aeec515ce723e5cbd50",
                    "color.teal.200":
                        "51e867e053545af64de0c79505882d32bdf79d13",
                    "color.teal.300":
                        "cba9c3ab71040794f6ce0e968ecf5dbdbe5f98de",
                    "color.teal.400":
                        "ab206bc676ec289e4646aa7c1b8dd00623b6726b",
                    "color.teal.500":
                        "90146807af0da0d4b9bc904a3ccd1246d2e4f3e8",
                    "color.teal.600":
                        "13ab40b2280e116f792c5d9526093f96e5d02193",
                    "color.teal.700":
                        "4fcb21b2174ba42cefdff665d8ac79561ebbc252",
                    "color.teal.800":
                        "81466c0735287b6d121bfdce72fd2d09451311fe",
                    "color.teal.900":
                        "d0920e427c00d5a17c6ad6cfdd3ef4f78668f682",
                    "color.teal.1000":
                        "e9f106c70f7653fe85d6eb92e4256f3f94d3b7b3",
                    "color.blue.100":
                        "a02c5108ed42ad114961936de76ad0ce3ae2dfbc",
                    "color.blue.200":
                        "b726d78d5d7699ed2fa37d03d758961408e7dfa9",
                    "color.blue.300":
                        "447f65a4605b9f32e814120a26870e43159d6721",
                    "color.blue.400":
                        "ee7c89c93e4c24de927d3309e9a5da6de2f2b6dc",
                    "color.blue.500":
                        "19c018cfcffb66bddf0d6fe7d5ef471c91a065e4",
                    "color.blue.600":
                        "58642452e38a1be626d96ba27b73e4a1ee778ab9",
                    "color.blue.700":
                        "f1f79eeb45917479205225e98e4d3230f78cc768",
                    "color.blue.800":
                        "5a3762d48dc0a4e7854eeda98e512c279a91a5c0",
                    "color.blue.900":
                        "6720104f0f5887785d526fa68dbf63b9a13290c8",
                    "color.blue.1000":
                        "88eb1fc9a254fba2281b10fb56f0b3f1e70c3a22",
                    "color.purple.100":
                        "97b638e8936af99453ec2e242260d0fba148ec50",
                    "color.purple.200":
                        "9269e11f0dcd82cb3242b284d528820f35586227",
                    "color.purple.300":
                        "08ccad18ce73a1ba1dc530d436e3b217f7ffbef5",
                    "color.purple.400":
                        "95d208c070e166dfb5ec194317dad7ec81213c63",
                    "color.purple.500":
                        "58c4054bf370f1805dc3e12f75010378c189c0c5",
                    "color.purple.600":
                        "262f98dfa3abea4f1c4bf54d21af4083e231de0f",
                    "color.purple.700":
                        "891f1e85692d957179e8b0c07486b6192f4d04ec",
                    "color.purple.800":
                        "e7e5e2c8f7802911b91ca1c0fea61ed5587c8f82",
                    "color.purple.900":
                        "24da4a7f944ac8d52b918a603ca54e3ad614edbe",
                    "color.purple.1000":
                        "6b2be37d70576b19e078d1dbb007233aef6e5f1b",
                    "color.green.100":
                        "f7d5573dac0c3fb3658ebbd03e73b3043181e317",
                    "color.green.200":
                        "23860c6572d9a1e19a3b9a901c699042d22edc97",
                    "color.green.300":
                        "52e32df2a5242a2a0abfd500da4207e4865fce0a",
                    "color.green.400":
                        "735f689694c7718af4d535dc2aace89356e86c25",
                    "color.green.500":
                        "b956d0a79123e40f76fa4c8b7d248a06e71c5695",
                    "color.green.600":
                        "80bc8f29929846b070ac94797cdcad42ec773a38",
                    "color.green.700":
                        "05bb8d3617fa017d18e5d94a12b221eb46b283e0",
                    "color.green.800":
                        "061d442dce9bce0d87ffdc0eb33afd8cd3716840",
                    "color.green.900":
                        "5866f0f736c20085e0c59182c120a15cd422ef89",
                    "color.green.1000":
                        "0769186e3afb70c4324f21e6ca91861aec0df14e",
                    "color.red.100":
                        "ad7379f6123dc28508e074c9f4ede0a886bef22f",
                    "color.red.200":
                        "ec8b56856929e268bab450c5ead6376d988055fb",
                    "color.red.300":
                        "2415600433cea91dc10cd0258330484165f112d3",
                    "color.red.400":
                        "fed5ed7fb621f9f2dbd95b428c2e749218b0ef10",
                    "color.red.500":
                        "9263eeeee2ecb05aa96a9b025319280103650b62",
                    "color.red.600":
                        "9abfb7671b1169c9eea052decbd1e42fff62aa0a",
                    "color.red.700":
                        "00da917f93535bd3401b16f203168801edaa0213",
                    "color.red.800":
                        "c24d6cebb2365ccdb4ab27bec08be936fd64bdc6",
                    "color.red.900":
                        "739977d5f4259c606a1dc48f3e1fb5407230b78f",
                    "color.red.1000":
                        "8cca3b783aded3a9d28076cc39b20105ae7580aa",
                    "color.yellow.100":
                        "f8b6089f9bd98428e7440f91d66677093afe6446",
                    "color.yellow.200":
                        "4f49ff3703559335151b5546cc5957436633343a",
                    "color.yellow.300":
                        "c81b3f4512e175f29e86ceae7ed8eb3fd5605fac",
                    "color.yellow.400":
                        "c27543098a27f431cbad62caa40fe5ca3c750c68",
                    "color.yellow.500":
                        "330f450697cfbf62dd5d519865e6ff9e1653265a",
                    "color.yellow.600":
                        "a3511b45bea97c5a26412c936a8247cd4e4fe024",
                    "color.yellow.700":
                        "f5be739e95c992c3d14b6228efae284aba0061d7",
                    "color.yellow.800":
                        "5e88c253ed95bdfc6730a469d0b5774894137e73",
                    "color.yellow.900":
                        "9e1e9221b497e93d4a919b29c2f8f0a2fdb83e43",
                    "color.yellow.1000":
                        "f0811ce0dfac0e60e4a4b602282b1e8739b8e9de",
                    "color.gray.100":
                        "1b703e141e852f24e2cf4da2a38b1d44c0aca7ac",
                    "color.gray.200":
                        "71749e51bbe456f4caeb68e7b533b21ebb64ef8c",
                    "color.gray.300":
                        "e59e9683a7d23646a2eed4b6dad0faa980eef1d9",
                    "color.gray.400":
                        "73e84b98d3c15371a14d1f46c3c5fb895233d431",
                    "color.gray.500":
                        "8b40f94a346ab365f5655a41fc6f9365794fbc5a",
                    "color.gray.600":
                        "f028f8ec51c4b87c6ece14aa1c5ace77bfadee44",
                    "color.gray.700":
                        "2371172cf14421ed47c2bf85bedb3af511036c14",
                    "color.gray.800":
                        "caa4df2895c13487c16910f55d0c14b05cab76de",
                    "color.gray.900":
                        "987b40d92c476a604cade2fbf1d451b9bd0624a5",
                    "color.gray.1000":
                        "a38085be72b6c31948642a356f6a111661ed5274",
                },
            },
            {
                id: "6bc68fbb617bd1ec8c4dbfe4b3a93d43e4150cec",
                name: "light-normalContrast",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/color/light/normalContrast": "enabled",
                },
                group: "color-mode",
                $figmaCollectionId: "VariableCollectionId:1:3",
                $figmaModeId: "1:1",
                $figmaVariableReferences: {
                    "color.background.default":
                        "fdc9737d178eb7ba6aadf8757f9b14dfe6b2b81f",
                },
            },
            {
                id: "486b9bf22d10d96afe41cdda048d9b9ae2a030cd",
                name: "light-highContrast",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/color/light/highContrast": "enabled",
                },
                group: "color-mode",
                $figmaCollectionId: "VariableCollectionId:1:3",
                $figmaModeId: "1:2",
                $figmaVariableReferences: {
                    "color.background.default":
                        "fdc9737d178eb7ba6aadf8757f9b14dfe6b2b81f",
                },
            },
            {
                id: "dd744a4c1081ecc2802baf6d434e2de0a1a12b03",
                name: "dark-normalContrast",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/color/dark/normalContrast": "enabled",
                },
                group: "color-mode",
                $figmaCollectionId: "VariableCollectionId:1:3",
                $figmaModeId: "1:3",
                $figmaVariableReferences: {
                    "color.background.default":
                        "fdc9737d178eb7ba6aadf8757f9b14dfe6b2b81f",
                },
            },
            {
                id: "468bac96e65ff9ae7a224ed5dae01cdcf3c4893a",
                name: "dark-highContrast",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/color/dark/highContrast": "enabled",
                },
                group: "color-mode",
                $figmaCollectionId: "VariableCollectionId:1:3",
                $figmaModeId: "1:4",
                $figmaVariableReferences: {
                    "color.background.default":
                        "fdc9737d178eb7ba6aadf8757f9b14dfe6b2b81f",
                },
            },
            {
                id: "22637ee896789d4827b1980b361a7847123dc686",
                name: "default",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/dimension/primitive": "enabled",
                },
                group: "dimension-primitive",
                $figmaCollectionId: "VariableCollectionId:1:4",
                $figmaModeId: "1:5",
                $figmaVariableReferences: {
                    "dimension.size.height.baseline":
                        "ad5cb27e689b417483c763e2557a7d48fc187a9c",
                    "dimension.100":
                        "50c833d3607ce4c3d72964b5cbc25f58726fe9a5",
                    "dimension.150":
                        "86aea2116c4dc51576885636e09d771c284be621",
                    "dimension.175":
                        "3bc2a12c43521ddace6fd8e8ae0eba4cec61034f",
                    "dimension.200":
                        "50e049c74007c41030e1509b0e9f41320b658a02",
                    "dimension.225":
                        "42cde37b231861a62f21a185ad6e9588333c1c46",
                    "dimension.250":
                        "6b4ea04275ce6e70a6178f831fa8932694051356",
                    "dimension.300":
                        "bcb017619b7321d804fd152b910e85cf5123467d",
                    "dimension.400":
                        "b0e47648792a49eb755daf3c4fd385203662b398",
                    "dimension.500":
                        "257d94571a9968479fd43ece0be7c703c1320b1a",
                    "dimension.600":
                        "a4ecc41153afe716d70d41d8e60dd7acfb91c17b",
                    "dimension.700":
                        "ce57ccd2c586f14f898a8df2d68967ae0b60e87c",
                    "dimension.800":
                        "6ee85686739672f6469cfbe79ad0267d6bba375e",
                    "dimension.900":
                        "4e45286654a56324e858393399b92d99846487b8",
                    "dimension.1000":
                        "bf124af7d4051b06855d9fa6300cc7f66fccf1b1",
                    "dimension.1100":
                        "6316131ee39d596193f5f909d5dfd913d123cd28",
                    "dimension.025":
                        "5c401a36458adf3ca315b388903904f9d28786ed",
                    "dimension.050":
                        "62493fd6b190b5df77c4ccf417404f45acdeae7a",
                    "dimension.borderWidth.medium":
                        "19e1050e760dd68ec8fdc40dd3df3dc06d038638",
                    "dimension.borderWidth.large":
                        "6e0a0dc1659af8859315cc68c910b971ea40d0d2",
                    "dimension.radius.none":
                        "6b442af6939eb9509d83b3b564c9d642cfabc28f",
                    "dimension.radius.small":
                        "e30728bd8415c8b3a2ed01318e2c45f0299c46fe",
                    "dimension.radius.medium":
                        "0b49f5fdba49a356ecbdd6e51d3a55dc35e9ab1b",
                    "dimension.radius.large":
                        "e81e6a3d3625cd97ccf7abc6e2f0225fab85c6fb",
                    "dimension.radius.full":
                        "8cec54310774f983fba29b1c2cf426bc69b12a02",
                    "dimension.size.fontSize.200":
                        "f52796f48c993b7d4c30657b97660bdc2023dbd6",
                    "dimension.size.fontSize.250":
                        "e6a5c0627c8f2e5333f897bb47a2501a0050b263",
                    "dimension.size.fontSize.300":
                        "b8fd8b62d3a0ce9467e6f89d86713d7deb5dd4be",
                    "dimension.size.fontSize.350":
                        "e20b1722829ae6a459eeaaa973230544737f1a4c",
                    "dimension.size.fontSize.400":
                        "b1d279d4ab2b7bc54baaa04229ee53b5310d9714",
                    "dimension.size.fontSize.450":
                        "58d39ead05815094efe303ae9f294ffbaac1a400",
                    "dimension.size.fontSize.500":
                        "04a25a154bab0068fb6dbf0f37b85c31574c3ff9",
                    "dimension.size.fontSize.550":
                        "514f5d1f72fa99fa554b317872dcd795cf6a514c",
                    "dimension.size.fontSize.600":
                        "752b14832c95f13dcaea763c791ee49914f31374",
                    "dimension.size.fontSize.650":
                        "88157a192b63e36b9af10c7aa5d68e197a21db95",
                    "dimension.size.fontSize.700":
                        "9bb977e8130d625a590de53d24f9f1c5f8030b94",
                    "dimension.size.fontSize.750":
                        "7f7bb982841db77c567b659eb46f082c0c045a42",
                    "dimension.size.fontSize.800":
                        "67cd183ebae11d7c04946a3e76ef6f4f4c7be949",
                    "dimension.size.fontSize.850":
                        "ed30d8cc5bb85a64dbb8277b040935b9886c62f1",
                    "dimension.size.fontSize.900":
                        "cd526e45e5b1d058adde54eb2402cee83e72a87a",
                    "dimension.size.fontSize.950":
                        "f5279a73e5ba7fa9ebb20ff469c05e30283221b7",
                    "dimension.size.fontSize.1000":
                        "920084d739636747db5e009bd880491681711741",
                    "dimension.size.lineHeight.200":
                        "73f383fc2b17f2485c141fe114da09db62b6e248",
                    "dimension.size.lineHeight.250":
                        "d626ab651b550af4a508520ad464291cb80be76c",
                    "dimension.size.lineHeight.300":
                        "db7828fc30ac70aa1088a135e09e0f31fcdc078d",
                    "dimension.size.lineHeight.350":
                        "eb0e3ef5a8fe45abf515e626c4891bb57c9dc852",
                    "dimension.size.lineHeight.400":
                        "11eb2b0bacc21896f294765905bb257b23b5b51e",
                    "dimension.size.lineHeight.450":
                        "a559b29eb866cee4e7e81815e62f822ecd7f9285",
                    "dimension.size.lineHeight.500":
                        "08407ad3c2a8fceab06a060b57f8f788ea752dd3",
                    "dimension.size.lineHeight.550":
                        "aa5f5375a70d5791c6f3bb30d73a2c29adda0ced",
                    "dimension.size.lineHeight.600":
                        "23cadc1459248e17a37465566e9d9d07d4853416",
                    "dimension.size.lineHeight.650":
                        "6ec228fd7732522652077de5b814b15b775dd68e",
                    "dimension.size.lineHeight.700":
                        "7858f64d7dad4404ca50dfc1ba28279c7e448f2d",
                    "dimension.size.lineHeight.750":
                        "9730d4cefbc9047dad25611258ad2405f211f6c8",
                    "dimension.size.lineHeight.800":
                        "9362122023b6fe979af4e9429546a35719e51aa9",
                    "dimension.size.lineHeight.850":
                        "fc1d23ce95b283c870e462c890d7e18c74e402e0",
                    "dimension.size.lineHeight.900":
                        "e899ffebbdd003351e86c193f5f3d458369468f0",
                    "dimension.size.lineHeight.950":
                        "23fadae1ba8b69368f6b9280d2db99752c582bb1",
                    "dimension.size.lineHeight.1000":
                        "70734411e73d1f5160d9eb0a2845b2f3d6a7bae6",
                    "dimension.space.top.text.baselineNudge.200":
                        "72ee4ede714477b16321a9eb2e1104b28c0abb14",
                    "dimension.space.top.text.baselineNudge.250":
                        "5bc26be10e5f2dbc0e0bef8a087600905a28b67e",
                    "dimension.space.top.text.baselineNudge.300":
                        "65d92671ea7a44661e73b0dfd5c6426bc273d49a",
                    "dimension.space.top.text.baselineNudge.350":
                        "8e1bd725de38bb76726b6a97cb027d66e78518e3",
                    "dimension.space.top.text.baselineNudge.400":
                        "2635d519f06fe276bbbb51fc95e0940d303805ae",
                    "dimension.space.top.text.baselineNudge.450":
                        "7eb540d957288c54d6662a2bd481c94227a05453",
                    "dimension.space.top.text.baselineNudge.500":
                        "a993a26d54d2c0586464352aa25bb55413c9d363",
                    "dimension.space.top.text.baselineNudge.550":
                        "160e584f24765c01597ae1d56a08e6e95e088853",
                    "dimension.space.top.text.baselineNudge.600":
                        "ad10fdf4ef54a031c78f680a32d218d72d06b36f",
                    "dimension.space.top.text.baselineNudge.650":
                        "e7e92806ce02888a32220ff3d173cf6620e70c50",
                    "dimension.space.top.text.baselineNudge.700":
                        "70448cc88d27dc4809ffb2de3a951c4e3ea85bea",
                    "dimension.space.top.text.baselineNudge.750":
                        "e1973edecb575cfd74b40e70ccc9707c33983c45",
                    "dimension.space.top.text.baselineNudge.800":
                        "69ad1800d2b8868ba7f50d8d73815377672f948d",
                    "dimension.space.top.text.baselineNudge.850":
                        "c908933c0938b441f521d10a0e4412b885aac405",
                    "dimension.space.top.text.baselineNudge.900":
                        "408f6526a368b9609f9cb598b894edd5f175e162",
                    "dimension.space.top.text.baselineNudge.950":
                        "759a36425c3858d08a3228edf82f4d9bfe4a78ba",
                    "dimension.space.top.text.baselineNudge.1000":
                        "561bbba580322326e5236b6aadfb93df4b28c18c",
                    "dimension.space.bottom.text.baselineNudge.200":
                        "635deb7b9778cbacb2509780070280317d6c69da",
                    "dimension.space.bottom.text.baselineNudge.250":
                        "679d523f1bd0900226d4b12dd8c5568bad7d8e63",
                    "dimension.space.bottom.text.baselineNudge.300":
                        "516b372355b66a727aca80b3fc789061467d28e6",
                    "dimension.space.bottom.text.baselineNudge.350":
                        "9d2c7af5794af7a37dae46980b796304054d4ac7",
                    "dimension.space.bottom.text.baselineNudge.400":
                        "d450606944f297e44ccbeb0121dde18033926651",
                    "dimension.space.bottom.text.baselineNudge.450":
                        "fdb500b24a137a77b14f780f39f86e33107e055e",
                    "dimension.space.bottom.text.baselineNudge.500":
                        "31a6d6a10deff1e2af27866f3feae2f138791800",
                    "dimension.space.bottom.text.baselineNudge.550":
                        "5074c90122df0539c7f436c070870f9f2d7fbf40",
                    "dimension.space.bottom.text.baselineNudge.600":
                        "52df932b82c4ce7dbb2bc55e9a9b28ddcb878f1c",
                    "dimension.space.bottom.text.baselineNudge.650":
                        "ecfa0894e434ae98b56ca4d617b00109429d015d",
                    "dimension.space.bottom.text.baselineNudge.700":
                        "e0f8ca1a2d7a7ff72a2c4f67ed139815fbb2d8f1",
                    "dimension.space.bottom.text.baselineNudge.750":
                        "4a8186fd6528284daa1b91ab50c967ecacc3dc52",
                    "dimension.space.bottom.text.baselineNudge.800":
                        "b679ad427dc9f45a535b3c01bd9c3d0e3f240152",
                    "dimension.space.bottom.text.baselineNudge.850":
                        "94c2e81e4529b95d78c6662844b3d3c6d4c394f4",
                    "dimension.space.bottom.text.baselineNudge.900":
                        "710d3cb8fa31f6014a876e05b12c589b0e906977",
                    "dimension.space.bottom.text.baselineNudge.950":
                        "851650de8e696390248e4e040011a4246f4967fd",
                    "dimension.space.bottom.text.baselineNudge.1000":
                        "59521610674372dbb91811f2f090e93c2d7bc1ed",
                    "dimension.letterSpacing.default":
                        "a4b09087b4a7726859fcf27245ce4a0dd0f60443",
                    "dimension.letterSpacing.wide":
                        "4a6ba458a9d883c94eda338f0e61d8770f07328a",
                },
            },
            {
                id: "5de3bdeca632ed7a143ba80c4023d18e4b3c8483",
                name: "small",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/dimension/small": "enabled",
                },
                group: "dimension-mode",
                $figmaCollectionId: "VariableCollectionId:1:5",
                $figmaModeId: "1:6",
                $figmaVariableReferences: {
                    "dimension.size.height.baseline":
                        "76ccf718315cb68e683e36be0d907c0f6db722c8",
                    "dimension.size.rootFontSize":
                        "2aeb88e1f07ce8fb0e64a3f582510a84164f58cc",
                },
            },
            {
                id: "8c127675180601746b9c5bbc72b1458fd48d231b",
                name: "medium",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/dimension/medium": "enabled",
                },
                group: "dimension-mode",
                $figmaCollectionId: "VariableCollectionId:1:5",
                $figmaModeId: "1:7",
                $figmaVariableReferences: {
                    "dimension.size.height.baseline":
                        "76ccf718315cb68e683e36be0d907c0f6db722c8",
                    "dimension.size.rootFontSize":
                        "2aeb88e1f07ce8fb0e64a3f582510a84164f58cc",
                },
            },
            {
                id: "0b7e3e1bf91019b3b8a37c98d764b5869e457e1a",
                name: "large",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/dimension/large": "enabled",
                },
                group: "dimension-mode",
                $figmaCollectionId: "VariableCollectionId:1:5",
                $figmaModeId: "1:8",
                $figmaVariableReferences: {
                    "dimension.size.height.baseline":
                        "76ccf718315cb68e683e36be0d907c0f6db722c8",
                    "dimension.size.rootFontSize":
                        "2aeb88e1f07ce8fb0e64a3f582510a84164f58cc",
                },
            },
            {
                id: "b30f21f5df6039c3b0d0a91c2a258174f17a8f75",
                name: "xLarge",
                $figmaStyleReferences: {},
                selectedTokenSets: {
                    "apps/dimension/xLarge": "enabled",
                },
                group: "dimension-mode",
                $figmaCollectionId: "VariableCollectionId:1:5",
                $figmaModeId: "1:9",
                $figmaVariableReferences: {
                    "dimension.size.height.baseline":
                        "76ccf718315cb68e683e36be0d907c0f6db722c8",
                    "dimension.size.rootFontSize":
                        "2aeb88e1f07ce8fb0e64a3f582510a84164f58cc",
                },
            },
            {
                id: "8388c741ae70433cce4cd5a5b49d1013346876f5",
                name: "default",
                $figmaStyleReferences: {
                    "typography.text.primary.default":
                        "S:16e4db3ed8d9048fbc46476e5919a57fca4daf0a,",
                    "typography.text.primary.bold":
                        "S:22d2aa875b85c8a0c79444af79b8c9e847631d71,",
                    "typography.text.primary.italic":
                        "S:e973e95dc879b44dcf2f9767fb4bd28eb0163f4f,",
                    "typography.text.primary.underline":
                        "S:865681da33766e2f897eeb6781d67b6e974cf4ca,",
                    "typography.text.primary.strikethrough":
                        "S:443ca5f09ce19384a0942d477b8b84f96b0aefd1,",
                    "typography.text.primary.smallcaps":
                        "S:5fba81895e816f74f8ddb0db63fa9878e49c8136,",
                    "typography.text.secondary.default":
                        "S:f075cabe5e1f9b4eea4b1fe4563f0a5e0b6e8fa2,",
                    "typography.text.secondary.bold":
                        "S:00a1fd80ffad22f37258152677aac38e4eb6bc23,",
                    "typography.text.secondary.italic":
                        "S:70bf4ae6e369d8d585536cc45a4be24b4138448b,",
                    "typography.text.secondary.underline":
                        "S:e91b053c34a60d7c9668d170907746c5932bcc12,",
                    "typography.text.secondary.strikethrough":
                        "S:da609c73e61f44c3067ed505058b9d73365fc600,",
                    "typography.text.secondary.smallcaps":
                        "S:290d7dd99b80b96585d54be2077829aa460423bf,",
                    "typography.text.tertiary.default":
                        "S:fc239e59c118fd651c915251f074b196b6c9b70e,",
                    "typography.text.tertiary.bold":
                        "S:f03b43a739ae99c57d00b878cd13168e8dece83c,",
                    "typography.text.tertiary.italic":
                        "S:49823df51cbfbf8eb1b3bfb45508a0daff77c948,",
                    "typography.text.tertiary.underline":
                        "S:1344d1a308839b5d4e647ff3542135c51d227cda,",
                    "typography.text.tertiary.strikethrough":
                        "S:0fd66ca36c0abf9294502149a1349f4bc8e4648a,",
                    "typography.text.tertiary.smallcaps":
                        "S:80d2fc1314fa94e830d0edfe78a0a869c49a81f2,",
                    "typography.heading.1.default":
                        "S:ee637eb52784ba91d0f5dd09c7d4dfb8202dfb7a,",
                    "typography.heading.1.bold":
                        "S:cfed4706edab8faa659c99458b2771e0375957a8,",
                    "typography.heading.1.italic":
                        "S:504791e0e63125fdaeeb78eff2997100eed6271e,",
                    "typography.heading.1.underline":
                        "S:7a17dd89546066187d1872c9da2f19e38e6c7f55,",
                    "typography.heading.1.strikethrough":
                        "S:7dae30c1e7f85334232059bef22a16c638aa6eef,",
                    "typography.heading.1.smallcaps":
                        "S:a452f6b4223f7e3ea61f7d43542d6a9781de4118,",
                    "typography.heading.2.default":
                        "S:572895d12d8ae1ca5d71ded64b002814ac90f022,",
                    "typography.heading.2.bold":
                        "S:47101c61db18fafc31757b007c1c19da0764a1a2,",
                    "typography.heading.2.italic":
                        "S:e2364f16c8354f1bfbe0fdd9bd617be501ada139,",
                    "typography.heading.2.underline":
                        "S:0737db9348665503fad1761827041f414ad2acd7,",
                    "typography.heading.2.strikethrough":
                        "S:b7e414c47d2c251d73caa28a74eaec8541f1d2df,",
                    "typography.heading.2.smallcaps":
                        "S:2413e6cb01ce999bca531c13be0e0aceb184ef3d,",
                    "typography.heading.3.default":
                        "S:90a148ba668df4d2c72618a487302bc3ef6fa2ec,",
                    "typography.heading.3.bold":
                        "S:5f57851e8c29f772df5985bd62e95a73c06af430,",
                    "typography.heading.3.italic":
                        "S:ed79d7216535f836098fc0cb2b1dd516907e014e,",
                    "typography.heading.3.underline":
                        "S:5b3e2f08f96eaf0f683974dbcb8ab0b160003ba0,",
                    "typography.heading.3.strikethrough":
                        "S:fbc08bdf23904ed58465efc17c2b257cb1ad09a2,",
                    "typography.heading.3.smallcaps":
                        "S:605f32160b544e675a5b589cb457ec5856739b39,",
                    "typography.heading.4.default":
                        "S:8c4dacbadef7f2fb623dbb2cb8a7715ec906d05d,",
                    "typography.heading.4.bold":
                        "S:76deb7954eed6dbbc61bc6e42e18dc9702d44334,",
                    "typography.heading.4.italic":
                        "S:4471c208827375b1e0910b913ef3b1462bd46ce6,",
                    "typography.heading.4.underline":
                        "S:b95112e7dcf37f6c3a352f35c27f00688d373de7,",
                    "typography.heading.4.strikethrough":
                        "S:f46a3952580c325698460e1b7f2f2595eab32140,",
                    "typography.heading.4.smallcaps":
                        "S:525edffbe132e69f0eafff6ca4fc1d28009b80e1,",
                    "typography.heading.5.default":
                        "S:88a341756cf0c65160b00e6d0c72dfe982510a75,",
                    "typography.heading.5.bold":
                        "S:dc0f174ce98789d2ba18b6510c57e44fd3c8c458,",
                    "typography.heading.5.italic":
                        "S:86db438eddb26bb8fcb75c77b0aba35c56091793,",
                    "typography.heading.5.underline":
                        "S:bd720c460378e690f02d498c7a101d2e7d306b4b,",
                    "typography.heading.5.strikethrough":
                        "S:12c15409e96be8e8cd13065014649095a5530441,",
                    "typography.heading.5.smallcaps":
                        "S:894344148754f11372c4113b45ca3d1b461b43c4,",
                    "typography.heading.6.default":
                        "S:e351f824608ab0ffc57df7678679db1a9bbcefbe,",
                    "typography.heading.6.bold":
                        "S:b775624890d6005614751fd6818cb617ace04163,",
                    "typography.heading.6.italic":
                        "S:31f3911f69bde8c4fdebf8ec85fc2f41f8b0099f,",
                    "typography.heading.6.underline":
                        "S:cd9d964b1f2c756b222ac01b8d16c19c4182446a,",
                    "typography.heading.6.strikethrough":
                        "S:41455476d0755a2914ee269d3446cf6ab21b8e1b,",
                    "typography.heading.6.smallcaps":
                        "S:6c73bea7ffafc33b4a90ce6f605177b6f8e29b5a,",
                    "typography.heading.display.default":
                        "S:141c776976dbdd0a40d4c2911b3abebfa50675af,",
                    "typography.heading.display.bold":
                        "S:17e8aa1ce6b7a6db56ebf6059560ff89b8496523,",
                    "typography.heading.display.italic":
                        "S:43d2f1b16d0009269e265eb80d9dabe476ef6ec1,",
                    "typography.heading.display.underline":
                        "S:8faf334081276425f9b4cd612b44ac6e0142dad7,",
                    "typography.heading.display.strikethrough":
                        "S:a825d38c2eee588d556124004fdb68b6eaa4d21e,",
                    "typography.heading.display.smallcaps":
                        "S:00b7879f2b7e914cefae6a83ba18edffe73a0f9b,",
                },
                selectedTokenSets: {
                    "apps/typography": "enabled",
                },
                group: "typography",
                $figmaCollectionId: "VariableCollectionId:1:6",
                $figmaModeId: "1:10",
                $figmaVariableReferences: {
                    "typography.fontFamily.sansSerif":
                        "56c1f30ee0f74dacb13a0fa7ec6845c9e010f798",
                    "typography.fontFamily.monospace":
                        "f41dac46b26843b447e76e3fc1dca6b14c757ef1",
                    "typography.fontFamily.default":
                        "f06c8dacce0991b386e71866a9ecdaa53c687bcd",
                    "typography.fontFamily.code":
                        "72e0e72b1ce69acaf3306e565c1b398fc10d88ce",
                    "typography.weight.thin":
                        "ef10f99dc767d3602e7108f35ebf37695d33884d",
                    "typography.weight.thinItalic":
                        "30587c1511908b3a51faacb0944d26f8f0d9af6f",
                    "typography.weight.extraLight":
                        "be779bce0ba171e0d578ee4390cd847432d0fb6e",
                    "typography.weight.extraLightItalic":
                        "a291f7bcb9263ecbfbd5443346ac1c12bf42ab80",
                    "typography.weight.light":
                        "0ac6d2ff80abffc0a2c72f9b8a1909d757f6895f",
                    "typography.weight.lightItalic":
                        "6a1fe11b7f85ba768b238cb4cffd2092db0397eb",
                    "typography.weight.regular":
                        "449b6d5dacdccde8e3e2bdc6922310cdb9a794d1",
                    "typography.weight.regularItalic":
                        "505d76a3015e64c07360294ed41d05d5c68d036e",
                    "typography.weight.medium":
                        "40c57eb1d1e19021269496219bc42cbd1d81e785",
                    "typography.weight.mediumItalic":
                        "86be56660b517f7d3f462bf1bb21a872979bfe84",
                    "typography.weight.semiBold":
                        "ef912ad58a7017bf1113cbc31c527751d7d31050",
                    "typography.weight.semiBoldItalic":
                        "af3762e7b455f6608e5676c85ccd7985b8f85562",
                    "typography.weight.bold":
                        "298edb4539f632cf73560e7f00abb11cace93dbd",
                    "typography.weight.boldItalic":
                        "9b0291d6455bc7d9bcafba90447f5b60c3f68f38",
                    "typography.weight.extraBold":
                        "9a46424815f1c1d6325f05aae988f3c4e1cd1214",
                    "typography.weight.extraBoldItalic":
                        "67e936ae727e4f1dfd5a9bdbd3dce9149a645878",
                },
            },
        ]

        await fs.writeFile(themesPath, JSON.stringify(themes, null, 2))
        console.log(`✓ Generated Figma themes: ${themesPath}`)
    },
}
