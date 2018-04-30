function findHorizon(f,totpixx,totpixy,roll,pitch,yaw,horizonangle)
totpixx = 4000;
totpixy = 3000;
f = 4000;

yaw = 0;
pitch = 70;
roll = 40;

horizonangle = 1.550798992821746 * 180/pi;
%% Compute FOV Constants
ifov = atan2d(1,f);
vfov = ifov*totpixy;
hfov = ifov*totpixx;

%% Computer corners
pix_of_corners = [totpixx, totpixy;
                  totpixx, 1;
                  1, 1;
                  1, totpixy];

az_center = yaw;
el_center = pitch;
cornerazel = [ hfov/2  vfov/2;
               hfov/2 -vfov/2;
              -hfov/2 -vfov/2;
              -hfov/2  vfov/2];

R = [cosd(roll) -sind(roll); sind(roll) cosd(roll)];
rotazel = cornerazel * R;
azel_of_corners = [az_center el_center] + rotazel;

%% Make 8x5 matrix for each corner and possible itnersection
% [isused,az,al,x,y]
% (1,3,5,7) are corners, others are in between segments
CornerPixRaw = nan(8,5);

% fill in corners
CornerPixRaw(1:2:end,:) = [ones(4,1) azel_of_corners pix_of_corners];
CornerPix = CornerPixRaw;
for i=1:2:8
    i1 = i;
    i2 = i+2;
    if i2>8
       i2 = 1; 
    end
    az1 = CornerPixRaw(i1,2);
    el1 = CornerPixRaw(i1,3);
    az2 = CornerPixRaw(i2,2);
    el2 = CornerPixRaw(i2,3);
   
    T = (horizonangle-el1)/(el2-el1);
    
    if T>0 && T<1
        if el1>el2
            CornerPix(i1,:)=nan;
        else
            CornerPix(i2,:)=nan;
        end
        x1 = CornerPixRaw(i1,4);
        y1 = CornerPixRaw(i1,5);
        x2 = CornerPixRaw(i2,4);
        y2 = CornerPixRaw(i2,5);
        
        seg_xpix = x1+(x2-x1)*T;
        seg_ypix = y1+(y2-y1)*T;
        seg_az = az1+(az2-az1)*T;
        seg_el = el1+(el2-el1)*T;
        CornerPix(i1+1,:) = [1 seg_az seg_el seg_xpix seg_ypix];
    end
end
badinds = isnan(CornerPix(:,1)) | CornerPix(:,3)>horizonangle;
CornerPix(badinds,:)=[];

badinds = isnan(CornerPixRaw(:,1));
CornerPixRaw(badinds,:)=[];

%% Plot 
figure(10);clf
plot([CornerPixRaw(:,2); CornerPixRaw(1,2)],[CornerPixRaw(:,3); CornerPixRaw(1,3)],'r-');
hold on
plot([-180 540],[0 0],'k-');
plot([-180 540],[horizonangle horizonangle],'k--');
plot([0 0],[-180 180],'b');
plot([360 360],[-180 180],'b');
plot(az_center,el_center,'r*');
fill([CornerPix(:,2); CornerPix(1,2)],[CornerPix(:,3); CornerPix(1,3)],'g');

xticks(-90:20:450)
yticks(-90:10:180)
axis tight
axis equal
axis([-90 360+90 -90 180]);

grid on
xlabel('Azimuth');
ylabel('Elevation');
end