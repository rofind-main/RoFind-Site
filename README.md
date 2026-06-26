# RoFind

> Discover games worth playing, shared by the people who actually play them.

<p align="center">
  <img src="./public/images/Preview/Main.png" width="45%" />
  <img src="./public/images/Preview/User.png" width="45%" />
</p>
<p align="center">
  <img src="./public/images/Preview/Preview.png" width="25%" />
</p>
<p align="center"><sub>These are early screenshots.</sub></p>

## What is RoFind?

**RoFind** is an open-source platform where players recommend, rate, and discover games together.

Inspired by Better Discovery - Mariage Sorcière on Roblox.

## Technologies used

1. Roblox API (Game Information)
2. Vercel (Hosting)
3. Firebase (Database)
4. Discord Webhook (Moderation of submissions)
5. Sato Player (Video Embed)

## How it works

**RoFind** is simply just a collection of games or _"experiences"_ and by using Roblox built in protocol `roblox://` the protocol will request an application to run which is the Roblox Launcher!

Direct play without the Roblox Launcher is a limitation being faced with this project. It also won't work without an already logged on account on the launcher itself.

Playing games will use the protocol and pass an argument or a link like `roblox://placeId=PLACEID`. Where the "PLACEID" can be `142823291` (Murder Mystery 2 by [Nikilis](https://www.roblox.com/users/1848960/profile/))

The `roblox://` protocol has been around for long too! (_found it by accident when i was a kid_)

## Heads Up

> Roblox Launcher should be installed and an account logged in to play!
> User Data (Login, Favorite, Comment, and much more) is in development. Thank you for understanding!

## Planned Features

- Browse games submitted by the community
- Rate and leave reviews
- Filter by genre, author, or popularity
- Submit your own game for others to find
- Login to save your reviews and ratings
- Screenshots or backup saves of submitted games

## Roadmap

- [x] Game submission system
- [x] Rating & review system
- [ ] User profiles
- [ ] Search & filtering
- [ ] Moderation tools

## Support

- Desktop (Windows) _Soon_
- Browsers listed below

| Tested Browsers | Support |
| --------------- | ------- |
| Chrome          | ✅       |
| Brave           | ✅       |
| Firefox         | ✅       |
| Opera           | ✅       |
| Safari          | ❔       |

## Have questions?

Join the [Discord](https://discord.gg/CryHUshKT7) server! _Invite Code: (CryHUshKT7)_

## AI Usage

AI usage to this project is limited and only used for cleaning up code and fixing styling issues. Rest assured that the project has seen human intervention.

## License

MIT License. See `LICENSE`.

## Legal

**Roblox** is a registered trademark of **Roblox Corporation**. RoFind is not affiliated with, endorsed by, or sponsored by **Roblox Corporation**. All game names, images, and related content belong to their respective owners.

---

Built by the community, for the community.
