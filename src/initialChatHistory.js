import {MessageDirection} from './Chat/chat.enum';

const SENTENCES = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Phasellus vulputate odio commodo tortor sodales, et vehicula ipsum viverra.',
    'In et mollis velit, accumsan volutpat libero.',
    'Nulla rutrum tellus ipsum, eget fermentum sem dictum quis.',
    'Suspendisse eget vehicula elit.',
    'Proin ut lacus lacus.',
    'Aliquam erat volutpat.',
    'Vivamus ac suscipit est, et elementum lectus.',
    'Cras tincidunt nisi in urna molestie varius.',
    'Integer in magna eu nibh imperdiet tristique.',
    'Curabitur eu pellentesque nisl.',
    'Etiam non consequat est.',
    'Duis mi massa, feugiat nec molestie sit amet, suscipit et metus.',
    'Curabitur ac enim dictum arcu varius fermentum vel sodales dui.',
    'Ut tristique augue at congue molestie.',
    'Integer semper sem lorem, scelerisque suscipit lacus consequat nec.',
    'Etiam euismod efficitur magna nec dignissim.',
    'Morbi vel neque lectus.',
    'Etiam ac accumsan elit, et pharetra ex.',
    'Suspendisse vitae gravida mauris.',
    'Pellentesque sed laoreet erat.',
    'Nam aliquet purus quis massa eleifend, et efficitur felis aliquam.',
    'Fusce faucibus diam erat, sed consectetur urna auctor at.',
    'Praesent et nulla velit.',
    'Cras eget enim nec odio feugiat tristique eu quis ante.',
    'Morbi blandit diam vitae odio sollicitudin finibus.',
    'Integer ac ante fermentum, placerat orci vel, fermentum lacus.',
    'Maecenas est elit, semper ut posuere et, congue ut orci.',
    'Phasellus eget enim vitae nunc luctus sodales a eu erat.',
    'Curabitur dapibus nisi sed nisi dictum, in imperdiet urna posuere.',
    'Vivamus commodo odio metus, tincidunt facilisis augue dictum quis.',
    'Curabitur sagittis a lectus ac sodales.',
    'Nam eget eros purus.',
    'Nam scelerisque et ante in porta.',
    'Proin vitae augue tristique, malesuada nisl ut, fermentum nisl.',
    'Nulla bibendum quam id velit blandit dictum.',
    'Cras tempus ac dolor ut convallis.',
    'Sed vel ipsum est.',
    'Nulla ut leo vestibulum, ultricies sapien ac, pellentesque dolor.',
    'Etiam ultricies maximus tempus.',
    'Donec dignissim mi ac libero feugiat, vitae lacinia odio viverra.',
    'Curabitur condimentum tellus sit amet neque posuere, condimentum tempus purus eleifend.',
    'Donec tempus, augue id hendrerit pretium, mauris leo congue nulla, ac iaculis erat nunc in dolor.',
    'Praesent vel lectus venenatis, elementum mauris vitae, ullamcorper nulla.',
    'Maecenas non diam cursus, imperdiet massa eget, pellentesque ex.',
    'Vestibulum luctus risus vel augue auctor blandit.',
    'Nullam augue diam, pulvinar sed sapien et, hendrerit venenatis risus.',
    'Quisque sollicitudin nulla nec tellus feugiat hendrerit.',
    'Vestibulum a eros accumsan, lacinia eros non, pretium diam.',
    'Aenean iaculis augue sit amet scelerisque aliquam.',
    'Donec ornare felis et dui hendrerit, eget bibendum nibh interdum.',
    'Maecenas tellus magna, tristique vitae orci vel, auctor tincidunt nisi.',
    'Fusce non libero quis velit porttitor maximus at eget enim.',
    'Sed in aliquet tellus.',
    'Etiam a tortor erat.',
    'Donec nec diam vel tellus egestas lobortis.',
    'Vivamus dictum erat nulla, sit amet accumsan dolor scelerisque eu.',
    'In nec eleifend ex, pellentesque dapibus sapien.',
    'Duis a mollis nisi.',
    'Sed ornare nisl sit amet dolor pellentesque, eu fermentum leo interdum.',
    'Sed eget mauris condimentum, molestie justo eu, feugiat felis.',
    'Nunc suscipit leo non dui blandit, ac malesuada ex consequat.',
    'Morbi varius placerat congue.',
    'Praesent id velit in nunc elementum aliquet.',
    'Sed luctus justo vitae nibh bibendum blandit.',
    'Sed et sapien turpis.',
    'Nulla ac eros vestibulum, mollis ante eu, rutrum nulla.',
    'Sed cursus magna ut vehicula rutrum.',
    'Ut consectetur feugiat consectetur.',
    'Nulla nec ligula posuere neque sollicitudin rutrum a a dui.',
    'Nulla ut quam odio.',
    'Integer dignissim sapien et orci sodales volutpat.',
    'Nullam a sapien leo.',
    'Praesent cursus semper purus, vitae gravida risus dapibus mattis.',
    'Sed pellentesque nulla lorem, in commodo arcu feugiat sed.',
    'Phasellus blandit arcu non diam varius ornare.',
];

const MESSAGES_COUNT = 10000;
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const initialChatHistory = [];

const getRandomNumber = (i) => Math.floor(Math.random() * i);

for (let i = 0; i < MESSAGES_COUNT; i++) {
    const sentences = Math.ceil(Math.random() * 5);
    const texts = [];

    for (let x = 0; x < sentences; x++) {
        texts.push(SENTENCES[getRandomNumber(SENTENCES.length)]);
    }

    initialChatHistory.push({
        text: texts.join(' '),
        direction: Math.random() > 0.5 ? MessageDirection.IN : MessageDirection.OUT,
        timestamp: now - getRandomNumber(MESSAGES_COUNT/10) * day,

    });
}
