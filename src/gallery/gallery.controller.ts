import { Controller , Get} from '@nestjs/common';

@Controller('gallery')
export class GalleryController {

    @Get()
    getVideoList(): string{
        return "This is the video list";
    }
}
