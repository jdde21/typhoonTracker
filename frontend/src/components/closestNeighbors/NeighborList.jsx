import { useContext } from "react";
import { TyphoonDataContext } from '../../App.jsx';
import SliderPkg from 'react-slick';
import NeighborTyphoonCard from "../typhoonPrediction/NeighborTyphoonCard";

const NeighborList = () => {
    const { fetching, neighboringTyphoons, neighboringTyphoonsNames, neighboringTyphoonsAdditionalProperties } = useContext(TyphoonDataContext);
    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 3,
        slidesToScroll: 3,
    };

    const Slider = SliderPkg.default;
    return (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full">
            <div className="w-[80%] m-auto">
                {fetching ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-sm text-gray-300">Loading neighboring typhoons...</span>
                        </div>
                    </div>
                ) : (
                    <Slider {...settings}>
                        {Object.keys(neighboringTyphoons).map((sid) => {
                            return <NeighborTyphoonCard
                                key={sid}
                                name={neighboringTyphoonsNames[sid]}
                                sid={sid}
                                category={'CAT 5'}
                                wind={
                                    neighboringTyphoonsAdditionalProperties[sid].length !== 0
                                        ? `${neighboringTyphoonsAdditionalProperties[sid][1]} knots`
                                        : "No Data"
                                }
                                pressure={
                                    neighboringTyphoonsAdditionalProperties[sid].length !== 0
                                        ? `${neighboringTyphoonsAdditionalProperties[sid][2]} mb`
                                        : "No Data"
                                }
                                tracks={neighboringTyphoons[sid][0]}
                                score={neighboringTyphoons[sid][1]}
                            />
                            })}
                    </Slider>
                )}
            </div>
        </div>
    )
}

export default NeighborList
