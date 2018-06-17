%%
clc
cam = xml2struct('C:\Users\slocumr\Downloads\MissionPlanner-latest\camerasBuiltin.xml');
dat = cam.Cameras.Camera;

fprintf('let cameras = [\n')
for i=1:numel(dat)
    camname = dat{i}.name.Text;
    campixx = str2double(dat{i}.imgw.Text);
    campixy = str2double(dat{i}.imgh.Text);
    camf = str2double(dat{i}.flen.Text) * str2double(dat{i}.imgw.Text) / str2double(dat{i}.senw.Text);
    
    fprintf('{\n')
    fprintf('\t"name": "%s",\n',camname);
    fprintf('\t"f": "%.1f",\n',camf);
    fprintf('\t"pixx": "%.0f",\n',campixx);
    fprintf('\t"pixy": "%.0f",\n',campixy);
    if i==numel(dat)
        fprintf('}\n');
    else
        fprintf('},\n');
    end

end
fprintf('];\n');