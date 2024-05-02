import {
  Avatar,
  VStack,
  Text,
  Card,
  CardBody,
  Image,
  Box,
  Center,
  Spinner
} from '@chakra-ui/react';
import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  ShapeProps,
  ShapeUtil,
  T,
  TLBaseShape,
  TLOnClickHandler
} from 'tldraw';
import runes from 'runes';

export type IUserDetailShape = TLBaseShape<
  'userDetail',
  {
    w: number;
    h: number;
    fid: number;
    pfp: string;
    displayName: string;
    bio: string;
    userName: string;
    address: string;
    onClick: () => void;
    preview: string;
  }
>;

const cardShapeProps: ShapeProps<IUserDetailShape> = {
  w: T.number,
  h: T.number,
  fid: T.positiveInteger,
  pfp: T.string,
  displayName: T.string,
  bio: T.string,
  userName: T.string,
  address: T.string,
  onClick: T.any,
  preview: T.string
};

export class UserDetailShapeUtil extends ShapeUtil<IUserDetailShape> {
  static override type = 'userDetail' as const;
  static override props = cardShapeProps;

  override onClick?: TLOnClickHandler<IUserDetailShape> = (shape) => {
    shape.props.onClick();
  };

  override hideResizeHandles = () => true;
  override hideRotateHandle = () => true;
  override hideSelectionBoundsBg = () => true;
  override hideSelectionBoundsFg = () => true;

  getDefaultProps(): IUserDetailShape['props'] {
    return {
      w: 200,
      h: 200,
      fid: 0,
      pfp: '',
      displayName: '',
      bio: '',
      userName: '',
      address: '',
      onClick: () => {},
      preview: ''
    };
  }

  getGeometry(shape: IUserDetailShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true
    });
  }

  component(shape: IUserDetailShape) {
    return (
      <HTMLContainer>
        <VStack spacing={2} w={shape.props.w} h={shape.props.h}>
          <VStack spacing={1} w="full">
            <Avatar
              src={shape.props.pfp ?? ''}
              shadow="xl"
              borderWidth={2}
              borderColor="white"
            />
            <VStack spacing={0}>
              <Text fontWeight={600}>
                {`${!!shape.props.displayName ? runes.substr(shape.props.displayName, 0, 8) : ''}${!!shape.props.displayName?.length && shape.props.displayName?.length > 8 ? '...' : ''}`}
              </Text>
              <Text
                textColor="gray"
                fontSize="small"
              >{`@${shape.props.userName}`}</Text>
            </VStack>
          </VStack>

          <Card shadow="xl">
            <CardBody bgColor="#F8FBFC" borderColor="white" borderWidth={4}>
              {!!shape.props.preview ? (
                <Box w={150} h={200} pos="relative">
                  <Image
                    w="full"
                    h="full"
                    src={shape.props.preview}
                    objectFit="contain"
                    pos="relative"
                    zIndex={10}
                    alt="Preview"
                  />
                  <Center w="full" h="full" top={0} left={0} pos="absolute">
                    <Spinner />
                  </Center>
                </Box>
              ) : (
                <Box w={150} h={200} />
              )}
            </CardBody>
          </Card>
        </VStack>
      </HTMLContainer>
    );
  }

  indicator(shape: IUserDetailShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
